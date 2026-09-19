importScripts('https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js');

const CACHE_NAME = 'p2p-cdn-universal-v1';
const client = new WebTorrent();

const TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce'
];

async function getSHA1Hash(text) {
  const buffer = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol.startsWith('ws') || !url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  const fileUrl = request.url;

  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('⚡ [P2P-CDN] Instant Load (Cache API):', fileUrl);
    return cachedResponse;
  }

  const hash = await getSHA1Hash(fileUrl);
  const trackerQuery = TRACKERS.map(t => 'tr=' + encodeURIComponent(t)).join('&');
  const magnetURI = 'magnet:?xt=urn:btih:' + hash + '&' + trackerQuery;

  return new Promise((resolve) => {
    let p2pSuccess = false;

    client.add(magnetURI, { announce: TRACKERS }, (torrent) => {
      const file = torrent.files[0];
      if (file) {
        file.getBlob((err, blob) => {
          if (!err) {
            p2pSuccess = true;
            console.log('🚀 [P2P-CDN] Loaded via P2P Peer:', fileUrl);

            const response = new Response(blob, {
              headers: { 
                'Content-Type': blob.type || 'application/octet-stream',
                'Access-Control-Allow-Origin': '*'
              }
            });

            cache.put(request, response.clone());
            resolve(response);
          }
        });
      }
    });

    setTimeout(async () => {
      if (!p2pSuccess) {
        console.log('🏠 [P2P-CDN] 0 Peers. Fetching from Server & Caching:', fileUrl);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          resolve(networkResponse);
        } catch (err) {
          resolve(fetch(request));
        }
      }
    }, 2500);
  });
}
