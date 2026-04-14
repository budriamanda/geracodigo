'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

/**
 * Dispara page_view padrão do GA4 no carregamento inicial e em toda navegação SPA.
 * Substitui o page_view automático do gtag('config') que foi suprimido com send_page_view:false.
 */
export default function NavigationTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
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
