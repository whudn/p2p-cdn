/**
 * P2P Universal CDN v1.0.2
 */
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    // Mendaftarkan Service Worker langsung dari file sw.js di CDN jsDelivr
    navigator.serviceWorker.register('https://cdn.jsdelivr.net/gh/whudn/p2p-cdn@main/sw.js')
      .then(() => console.log('⚡ [P2P-CDN] Universal Engine Active!'))
      .catch((err) => console.error('❌ [P2P-CDN] Registration Failed:', err));
  });
})();
