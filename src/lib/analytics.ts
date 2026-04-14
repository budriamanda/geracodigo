import { hasAnalyticsConsent, hasAdvertisingConsent } from '@/lib/consent'
import type { ToolName } from '@/lib/analytics-types'
import { TOOL_CATEGORY } from '@/lib/analytics-types'
import {
  incrementCtaClick,
  markToolCompleteState,
  markToolStartState,
  shouldQualifyByEngagement,
  updateScrollState,
  updateTimeState,
} from '@/lib/analytics-qualified'

export type { ToolName } from '@/lib/analytics-types'

type GtagFn = (...args: unknown[]) => void

function gtag(...args: unknown[]) {
  const w = window as unknown as { gtag?: GtagFn }
  if (typeof w.gtag === 'function') {
    w.gtag(...args)
  }
}

const ADS_CONVERSION_ID = 'AW-18071358338/ITV-CJ2XxZccEIKXjKlD'

/** Valores em BRL para Smart Bidding (ajustar conforme negócio) */
const CONVERSION_VALUE = {
  generate: 1,
  download: 2,
  batch: 5,
  scan: 1,
  print: 2,
  copy: 1,
} as const

const SESSION_TOOL_START = 'gc_tool_start_v1_'
const SESSION_QUALIFIED = 'gc_qualified_session_v1_'

/** Mesma ferramenta + path disparada duas vezes em sequência (ex.: React Strict Mode em dev). */
const PAGE_VIEW_TOOL_DEDUPE_MS = 900
const recentPageViewToolAt = new Map<string, number>()

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

function getPagePath(): string {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

function getMarketingParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const u = new URL(window.location.href)
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'wbraid', 'gbraid'] as const
  const out: Record<string, string> = {}
  for (const k of keys) {
    const v = u.searchParams.get(k)
    if (v) out[k] = v
  }
  return out
}

function baseParams(tool?: ToolName): Record<string, unknown> {
  const page_path = getPagePath()
  const base: Record<string, unknown> = {
    page_path,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_referrer: typeof document !== 'undefined' ? document.referrer : '',
    page_type: tool ? 'tool' : 'other',
    device_type: getDeviceType(),
    ...getMarketingParams(),
  }
  if (tool) {
    base.tool_name = tool
    base.tool_category = TOOL_CATEGORY[tool]
  }
  return base
}

function sendEvent(name: string, params: Record<string, unknown>) {
  if (!hasAnalyticsConsent()) return
  gtag('event', name, params)
}

function sendConversion(args: { value: number; event_id: string }) {
  if (!hasAdvertisingConsent()) return
  gtag('event', 'conversion', {
    send_to: ADS_CONVERSION_ID,
    value: args.value,
    currency: 'BRL',
    transaction_id: args.event_id,
  })
}

function maybeFireToolStart(tool: ToolName) {
  if (typeof window === 'undefined') return
  const k = SESSION_TOOL_START + tool
  if (sessionStorage.getItem(k)) return
  sessionStorage.setItem(k, '1')
  markToolStartState(tool, getPagePath())
  sendEvent('tool_start', {
    ...baseParams(tool),
    event_id: generateEventId(),
  })
}

function isQualifiedAlreadyFired(tool: ToolName): boolean {
  if (typeof window === 'undefined') return true
  const k = `${SESSION_QUALIFIED}${tool}_${getPagePath()}`
  return sessionStorage.getItem(k) !== null
}

function markQualifiedFired(tool: ToolName) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(`${SESSION_QUALIFIED}${tool}_${getPagePath()}`, '1')
}

/** Uma vez por sessão + ferramenta + path */
function fireQualifiedSession(tool: ToolName, qualifiedReason: string, extra: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  if (!hasAnalyticsConsent()) return
  if (isQualifiedAlreadyFired(tool)) return
  markQualifiedFired(tool)
  sendEvent('qualified_session', {
    ...baseParams(tool),
    qualified_reason: qualifiedReason,
    event_id: generateEventId(),
    ...extra,
  })
}

/** Após conclusão de ação (generate, download, etc.): marca estado e dispara qualified por conversão */
function notifyToolComplete(tool: ToolName) {
  markToolCompleteState(tool, getPagePath())
  fireQualifiedSession(tool, 'tool_complete')
}

function tryFireQualifiedFromEngagement(tool: ToolName) {
  if (isQualifiedAlreadyFired(tool)) return
  const path = getPagePath()
  const { ok, reason } = shouldQualifyByEngagement(tool, path)
  if (!ok) return
  fireQualifiedSession(tool, reason)
}

/**
 * Página de ferramenta montada: page_view_tool + início de medição de tempo/scroll no componente cliente.
 * Deduplica eventos no mesmo tool+path dentro de ~1s (Strict Mode executa o efeito duas vezes em dev).
 */
export function trackPageViewTool(tool: ToolName) {
  if (typeof window === 'undefined') return
  const path = getPagePath()
  const key = `${tool}::${path}`
  const now = Date.now()
  const last = recentPageViewToolAt.get(key)
  if (last !== undefined && now - last < PAGE_VIEW_TOOL_DEDUPE_MS) return
  recentPageViewToolAt.set(key, now)
  sendEvent('page_view_tool', {
    ...baseParams(tool),
    event_id: generateEventId(),
  })
}

/**
 * page_view padrão do GA4 — dispara no carregamento inicial e em toda navegação SPA.
 * Envia page_location (URL completa), page_title e page_referrer para atribuição de canal.
 */
export function trackPageView() {
  if (typeof window === 'undefined') return
  sendEvent('page_view', {
    ...baseParams(),
    event_id: generateEventId(),
  })
}

const SCROLL_MILESTONES = [25, 50, 75, 90] as const
const TIME_MILESTONES_SEC = [30, 60, 120, 300] as const

export function trackScrollDepthReached(tool: ToolName, scrollDepth: number) {
  updateScrollState(tool, getPagePath(), scrollDepth)
  sendEvent('scroll_depth_reached', {
    ...baseParams(tool),
    scroll_depth: scrollDepth,
    event_id: generateEventId(),
  })
  tryFireQualifiedFromEngagement(tool)
}

export function trackTimeOnToolReached(tool: ToolName, timeSeconds: number) {
  updateTimeState(tool, getPagePath(), timeSeconds)
  sendEvent('time_on_tool_reached', {
    ...baseParams(tool),
    time_on_tool_seconds: timeSeconds,
    event_id: generateEventId(),
  })
  tryFireQualifiedFromEngagement(tool)
}

export { SCROLL_MILESTONES, TIME_MILESTONES_SEC }

/** Clique em CTA relevante (header, hero, etc.) */
export function trackCtaClick(tool: ToolName | undefined, ctaId: string, ctaLabel?: string) {
  const path = getPagePath()
  if (tool) incrementCtaClick(tool, path)
  sendEvent('cta_click', {
    ...baseParams(tool),
    cta_id: ctaId,
    cta_label: ctaLabel ?? ctaId,
    event_id: generateEventId(),
  })
  if (tool) tryFireQualifiedFromEngagement(tool)
}

export function trackGenerate(tool: ToolName, format: string) {
  maybeFireToolStart(tool)
  const eventId = generateEventId()
  sendEvent('tool_complete', {
    ...baseParams(tool),
    conversion_type: 'generate',
    tool_format: format,
    conversion_value: CONVERSION_VALUE.generate,
    currency: 'BRL',
    event_id: eventId,
  })
  sendConversion({ value: CONVERSION_VALUE.generate, event_id: eventId })
  notifyToolComplete(tool)
}

export function trackBatchGenerate(tool: ToolName, format: string, batchSuccessCount: number) {
  maybeFireToolStart(tool)
  const eventId = generateEventId()
  sendEvent('batch_action', {
    ...baseParams(tool),
    tool_format: format,
    batch_size: batchSuccessCount,
    batch_success_count: batchSuccessCount,
    engagement_level: batchSuccessCount >= 10 ? 'high' : 'standard',
    engagement_batch_intent: batchSuccessCount >= 10,
    event_id: eventId,
  })
  sendEvent('tool_complete', {
    ...baseParams(tool),
    conversion_type: 'batch',
    tool_format: format,
    batch_size: batchSuccessCount,
    conversion_value: CONVERSION_VALUE.batch,
    currency: 'BRL',
    event_id: eventId,
  })
  sendConversion({ value: CONVERSION_VALUE.batch, event_id: eventId })
  notifyToolComplete(tool)
}

export function trackDownload(tool: ToolName, format: string, fileType: string) {
  maybeFireToolStart(tool)
  const eventId = generateEventId()
  sendEvent('tool_complete', {
    ...baseParams(tool),
    conversion_type: 'download',
    tool_format: format,
    file_type: fileType,
    conversion_value: CONVERSION_VALUE.download,
    currency: 'BRL',
    event_id: eventId,
  })
  sendConversion({ value: CONVERSION_VALUE.download, event_id: eventId })
  notifyToolComplete(tool)
}

export function trackScan(format: string) {
  const tool = 'barcode_reader' as const
  maybeFireToolStart(tool)
  const eventId = generateEventId()
  sendEvent('tool_complete', {
    ...baseParams(tool),
    conversion_type: 'scan',
    tool_format: format,
    conversion_value: CONVERSION_VALUE.scan,
    currency: 'BRL',
    event_id: eventId,
  })
  sendConversion({ value: CONVERSION_VALUE.scan, event_id: eventId })
  notifyToolComplete(tool)
}

export function trackPrint(tool: ToolName, layout: string) {
  maybeFireToolStart(tool)
  const eventId = generateEventId()
  sendEvent('tool_complete', {
    ...baseParams(tool),
    conversion_type: 'print',
    tool_layout: layout,
    conversion_value: CONVERSION_VALUE.print,
    currency: 'BRL',
    event_id: eventId,
  })
  sendConversion({ value: CONVERSION_VALUE.print, event_id: eventId })
  notifyToolComplete(tool)
}

export function trackCopy(tool: ToolName, contentType: string) {
  maybeFireToolStart(tool)
  const eventId = generateEventId()
  sendEvent('tool_complete', {
    ...baseParams(tool),
    conversion_type: 'copy',
    content_type: contentType,
    conversion_value: CONVERSION_VALUE.copy,
    currency: 'BRL',
    event_id: eventId,
  })
  sendConversion({ value: CONVERSION_VALUE.copy, event_id: eventId })
  notifyToolComplete(tool)
}
