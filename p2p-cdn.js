/**
 * P2P Universal CDN v1.0.0
 * 100% Pure Script Engine (Zero Setup, All File Extensions Supported)
 */
(function () {
  if (!('serviceWorker' in navigator)) return;

  // Kode Service Worker Virtual (Berjalan di Network Layer Browser)
  const swCode = `
    importScripts('https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js');

    const CACHE_NAME = 'p2p-cdn-universal-v1';
    const client = new WebTorrent();

    // Tracker WebSocket Publik
    const TRACKERS = [
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.btorrent.xyz',
      'wss://tracker.files.fm:7073/announce'
    ];

    // Helper: SHA-1 Hash Generator untuk ID P2P File
    async function getSHA1Hash(text) {
      const buffer = new TextEncoder().encode(text);
      const hash = await crypto.subtle.digest('SHA-1', buffer);
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Intercept Semua Network Request (Gambar, Video, Audio, PDF, ZIP, CSS, JS)
    self.addEventListener('fetch', (event) => {
      const request = event.request;
      const url = new URL(request.url);

      // Abaikan request non-GET atau WebSocket
      if (request.method !== 'GET' || url.protocol.startsWith('ws') || !url.protocol.startsWith('http')) {
        return;
      }

      event.respondWith(handleFetch(request));
    });

    async function handleFetch(request) {
      const cache = await caches.open(CACHE_NAME);
      const fileUrl = request.url;

      // 1. INSTANT LOAD: Cek Cache API Lokal Browser (0 ms)
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('⚡ [P2P-CDN] Instant Load (Cache API):', fileUrl);
        return cachedResponse;
      }

      // 2. SWARM FETCH: Cari di Jaringan P2P
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

                // Simpan ke Cache API lokal untuk penggunaan berikutnya
                cache.put(request, response.clone());
                resolve(response);
              }
            });
          }
        });

        // 3. FALLBACK: Jika 0 Seeder / Timeout 2.5 Detik, ambil dari Server Asal
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
  `;

  // Ubah String SW Menjadi Virtual Blob URL
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);

  // Registrasi Service Worker Otomatis saat Web di-load
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl)
      .then(() => console.log('⚡ [P2P-CDN] Universal Engine Active!'))
      .catch((err) => console.error('❌ [P2P-CDN] Registration Failed:', err));
  });
})();
