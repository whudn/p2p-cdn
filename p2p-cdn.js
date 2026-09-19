/**
 * P2P Universal CDN v1.0.3
 * Cross-Origin Service Worker Loader
 */
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      // 1. Fetch isi kode Service Worker dari CDN sebagai teks
      const response = await fetch('https://cdn.jsdelivr.net/gh/whudn/p2p-cdn@main/sw.js');
      const swCode = await response.text();

      // 2. Buat Blob URL lokal (berjalan di origin/domain milik kustomer)
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);

      // 3. Daftarkan Service Worker
      await navigator.serviceWorker.register(swUrl);
      console.log('⚡ [P2P-CDN] Universal Engine Active!');
    } catch (err) {
      console.error('❌ [P2P-CDN] Registration Failed:', err);
    }
  });
})();
