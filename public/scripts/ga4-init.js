(function () {
  var s = document.currentScript;
  if (!s) return;
  var id = s.getAttribute('data-ga-id');
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() { dataLayer.push(arguments); };
  }
  window.gtag('js', new Date());
  window.gtag('config', id);
})();
