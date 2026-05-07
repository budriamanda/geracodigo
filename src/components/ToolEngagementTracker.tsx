'use client'

import { useEffect, useRef } from 'react'
import type { ToolName } from '@/lib/analytics-types'
import {
  SCROLL_MILESTONES,
  TIME_MILESTONES_SEC,
  trackPageViewTool,
  trackScrollDepthReached,
  trackTimeOnToolReached,
} from '@/lib/analytics'

type Props = {
  toolName: ToolName
}

/**
 * Dispara page_view_tool, marcos de scroll e tempo na página da ferramenta (remarketing + qualified_session).
 */
export default function ToolEngagementTracker({ toolName }: Props) {
  const scrollFired = useRef<Set<number>>(new Set())
  const timeFired = useRef<Set<number>>(new Set())
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    // Captura o pathname no momento do mount. Em SPA navigation (Next.js App Router),
    // a URL muda antes do React desmontar o componente — sem esse snapshot, o interval
    // ou o scroll handler podem ler window.location.pathname já como "/" e poluir o GA4.
    const mountedPath = window.location.pathname

    trackPageViewTool(toolName)
    startRef.current = Date.now()

    const onScroll = () => {
      // Garante que não disparamos eventos com o path da página nova
      if (window.location.pathname !== mountedPath) return
      const doc = document.documentElement
      const scrollTop = doc.scrollTop || document.body.scrollTop
      const height = doc.scrollHeight - doc.clientHeight
      const pct = height <= 0 ? 100 : Math.round((scrollTop / height) * 100)
      for (const m of SCROLL_MILESTONES) {
        if (pct >= m && !scrollFired.current.has(m)) {
          scrollFired.current.add(m)
          trackScrollDepthReached(toolName, m)
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    const interval = window.setInterval(() => {
      // Se o usuário já navegou para outra página, encerra o interval imediatamente
      if (window.location.pathname !== mountedPath) {
        window.clearInterval(interval)
        return
      }
      if (startRef.current === null) return
      const elapsedSec = Math.floor((Date.now() - startRef.current) / 1000)
      for (const m of TIME_MILESTONES_SEC) {
        if (elapsedSec >= m && !timeFired.current.has(m)) {
          timeFired.current.add(m)
          trackTimeOnToolReached(toolName, m)
        }
      }
      if (timeFired.current.size >= TIME_MILESTONES_SEC.length) {
        window.clearInterval(interval)
      }
    }, 1000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearInterval(interval)
    }
  }, [toolName])

  return null
}
