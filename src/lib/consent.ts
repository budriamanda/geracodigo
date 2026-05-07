import { createStore } from '@/lib/storage/typed-store'

export interface ConsentPreferences {
  analytics: boolean
  advertising: boolean
  timestamp: string
}

type GtagFn = (...args: unknown[]) => void

function gtag(...args: unknown[]) {
  const w = window as unknown as { gtag?: GtagFn }
  if (typeof w.gtag === 'function') {
    w.gtag(...args)
  }
}

function isValidConsent(data: unknown): data is ConsentPreferences {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as ConsentPreferences).analytics === 'boolean' &&
    typeof (data as ConsentPreferences).advertising === 'boolean' &&
    typeof (data as ConsentPreferences).timestamp === 'string'
  )
}

const consentStore = createStore<ConsentPreferences | null>({
  key: 'geracode_cookie_consent',
  defaultValue: null,
  validate: (v): v is ConsentPreferences | null => v === null || isValidConsent(v),
})

export function getConsent(): ConsentPreferences | null {
  return consentStore.get()
}

export function saveConsent(prefs: Omit<ConsentPreferences, 'timestamp'>): void {
  const consent: ConsentPreferences = {
    ...prefs,
    timestamp: new Date().toISOString(),
  }
  consentStore.set(consent)
  applyConsent(consent)
}

export function applyConsent(prefs: ConsentPreferences): void {
  gtag('consent', 'update', {
    analytics_storage: prefs.analytics ? 'granted' : 'denied',
    ad_storage: prefs.advertising ? 'granted' : 'denied',
    ad_user_data: prefs.advertising ? 'granted' : 'denied',
    ad_personalization: prefs.advertising ? 'granted' : 'denied',
  })
}

export function revokeConsent(): void {
  consentStore.clear()
  gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}

export function hasAnalyticsConsent(): boolean {
  // Analytics é opt-out: se o usuário ainda não interagiu com o banner,
  // o consent default do GA4 já está 'granted', então os eventos devem disparar.
  const prefs = getConsent()
  if (prefs === null) return true
  return prefs.analytics === true
}

export function hasAdvertisingConsent(): boolean {
  // Ads continua opt-in: só dispara após clique explícito em "Aceitar todos".
  const prefs = getConsent()
  return prefs?.advertising === true
}
