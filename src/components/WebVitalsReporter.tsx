'use client'

import { useEffect } from 'react'
import type { Metric } from 'web-vitals'
import { hasAnalyticsConsent } from '@/lib/consent'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function sendToGA4(metric: Metric) {
  if (!hasAnalyticsConsent()) return
  if (typeof window.gtag !== 'function') return

  // Parâmetros GA4-nativos. Os campos UA (event_category, event_label, non_interaction)
  // são ignorados silenciosamente pelo GA4 e foram removidos.
  // metric_value usa a mesma escala dos Core Web Vitals: CLS × 1000 → inteiro comparável.
  // metric_rating ('good' | 'needs-improvement' | 'poor') permite segmentar no Explorer.
  window.gtag('event', metric.name, {
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_delta: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
    metric_id: metric.id,
    metric_rating: metric.rating,
  })
}

export default function WebVitalsReporter() {
  useEffect(() => {
    const controller = new AbortController()
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      if (controller.signal.aborted) return
      onCLS(sendToGA4)
      onINP(sendToGA4)
      onLCP(sendToGA4)
      onFCP(sendToGA4)
      onTTFB(sendToGA4)
    })
    return () => { controller.abort() }
  }, [])

  return null
}
