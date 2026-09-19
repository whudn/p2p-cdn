/**
 * P2P Universal CDN v1.0.4
 * Pure Script SW Installer (Cross-Origin Support)
 */
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      // 1. Fetch isi kode Service Worker utama dari CDN
      const cdnSwUrl = 'https://cdn.jsdelivr.net/gh/whudn/p2p-cdn@main/sw.js';
      
      // 2. Buat wrapper script yang menggunakan importScripts ke CDN
      const swWrapperCode = `importScripts('${cdnSwUrl}');`;

      // 3. Buat Blob dari wrapper script tersebut
      const blob = new Blob([swWrapperCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);

      // 4. Daftarkan Service Worker via Blob URL Wrapper
      const reg = await navigator.serviceWorker.register(blobUrl, { scope: '/' });
      console.log('⚡ [P2P-CDN] Universal Engine Active!', reg);
    } catch (err) {
      console.error('❌ [P2P-CDN] Registration Failed:', err);
    }
  });
})();
