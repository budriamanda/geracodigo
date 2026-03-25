'use client'

import { useEffect } from 'react'
import type { Metric } from 'web-vitals'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function sendToGA4(metric: Metric) {
  if (typeof window.gtag !== 'function') return

  window.gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  })
}

export default function WebVitalsReporter() {
  useEffect(() => {
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      onCLS(sendToGA4)
      onINP(sendToGA4)
      onLCP(sendToGA4)
      onFCP(sendToGA4)
      onTTFB(sendToGA4)
    })
  }, [])

  return null
}
