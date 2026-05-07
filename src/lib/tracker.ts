/**
 * tracker.ts — singleton de analytics e consentimento.
 *
 * Resolve três problemas do design anterior:
 * 1. Race condition: CookieConsent chamava applyConsent() dentro do useState
 *    initializer (antes do mount), concorrendo com o script inline do <head>.
 *    Agora tracker.init() é chamado em useEffect — sempre após o mount.
 *
 * 2. Acoplamento: analytics.ts verificava consentimento em cada evento;
 *    consent.ts chamava gtag sem saber se ele foi carregado. Aqui tudo fica
 *    encapsulado em um lugar.
 *
 * 3. Testabilidade: createTracker(deps) aceita storage e gtag injetáveis,
 *    sem necessidade de vi.stubGlobal ou mocks de window.
 *
 * Uso mínimo (CookieConsent.tsx):
 *   import { tracker } from '@/lib/tracker'
 *   useEffect(() => { tracker.init() }, [])
 *   tracker.setConsent({ analytics: true, advertising: false })
 *
 * Os call sites de analytics.ts (trackGenerate, etc.) continuam funcionando
 * como antes — eles delegam para hasAnalyticsConsent/hasAdvertisingConsent
 * que por sua vez leem do mesmo consentStore usado aqui.
 */

import { getConsent, saveConsent, revokeConsent } from '@/lib/consent'
import type { ConsentPreferences } from '@/lib/consent'

export interface ConsentChoices {
  analytics: boolean
  advertising: boolean
}

type GtagFn = (...args: unknown[]) => void

export interface TrackerDeps {
  /** Substituto do window.gtag para testes. */
  gtag?: GtagFn
}

export interface Tracker {
  /**
   * Chama uma vez no mount do CookieConsent.
   * Aplica o consentimento salvo ao gtag (se existir).
   * Resolve a race condition com o script inline do <head>.
   */
  init(): void

  /**
   * Salva preferências no storage e atualiza o gtag consent mode.
   * Passa null para revogar (equivalente a "rejeitar tudo").
   */
  setConsent(choices: ConsentChoices | null): void

  /** Lê as preferências salvas (null = usuário não interagiu). */
  getConsent(): ConsentPreferences | null
}

export function createTracker(deps: TrackerDeps = {}): Tracker {
  const gtagFn: GtagFn = deps.gtag ?? ((...args) => {
    const w = window as unknown as { gtag?: GtagFn }
    if (typeof w.gtag === 'function') w.gtag(...args)
  })

  return {
    init() {
      if (typeof window === 'undefined') return
      const existing = getConsent()
      if (!existing) return
      // Aplica o consentimento salvo ao gtag via consent mode
      gtagFn('consent', 'update', {
        analytics_storage: existing.analytics ? 'granted' : 'denied',
        ad_storage: existing.advertising ? 'granted' : 'denied',
        ad_user_data: existing.advertising ? 'granted' : 'denied',
        ad_personalization: existing.advertising ? 'granted' : 'denied',
      })
    },

    setConsent(choices) {
      if (choices === null) {
        revokeConsent()
      } else {
        saveConsent(choices)
      }
    },

    getConsent() {
      return getConsent()
    },
  }
}

/** Singleton de produção — use este em componentes. */
export const tracker = createTracker()
