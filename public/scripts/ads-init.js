(function () {
  var el = document.currentScript || document.querySelector('script[data-ads-id]')
  var id = el && el.getAttribute('data-ads-id')
  if (!id) return
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { dataLayer.push(arguments) }
  }
  window.gtag('js', new Date())
  window.gtag('config', id)
})()
