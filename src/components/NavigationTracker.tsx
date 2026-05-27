'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

/**
 * Rotas que não devem ser rastreadas pelo GA4.
 * - /keystatic/* e /api/keystatic/* — admin do CMS (usa SPA routing interno com UUIDs)
 * - Paths com formato UUID puro — gerados pelo Keystatic durante navegação interna
 */
const SKIP_TRACKING_RE = /^\/(keystatic|api\/keystatic)\b|^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

/**
 * Dispara page_view padrão do GA4 no carregamento inicial e em toda navegação SPA.
 * Substitui o page_view automático do gtag('config') que foi suprimido com send_page_view:false.
 */
export default function NavigationTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (SKIP_TRACKING_RE.test(pathname)) return

    if (isFirstRender.current) {
      isFirstRender.current = false
      // Primeiro render: aguarda um frame para Next.js atualizar document.title via metadata
      requestAnimationFrame(() => {
        trackPageView()
      })
      return
    }

    // Navegação SPA: document.title já atualizado pelo Next.js antes do commit da rota
    trackPageView()
  }, [pathname, searchParams])

  return null
}
