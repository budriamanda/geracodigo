const CONSENT_KEY = 'geracode_cookie_consent'

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

export function getConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidConsent(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveConsent(prefs: Omit<ConsentPreferences, 'timestamp'>): void {
  if (typeof window === 'undefined') return

  const consent: ConsentPreferences = {
    ...prefs,
    timestamp: new Date().toISOString(),
  }

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  } catch { /* localStorage unavailable */ }

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
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CONSENT_KEY)
  } catch { /* localStorage unavailable */ }

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
