import { hasAnalyticsConsent, hasAdvertisingConsent } from '@/lib/consent'

type GtagFn = (...args: unknown[]) => void

function gtag(...args: unknown[]) {
  const w = window as unknown as { gtag?: GtagFn }
  if (typeof w.gtag === 'function') {
    w.gtag(...args)
  }
}

const ADS_CONVERSION_ID = 'AW-18071358338/ITV-CJ2XxZccEIKXjKlD'

function sendEvent(name: string, params: Record<string, unknown>) {
  if (!hasAnalyticsConsent()) return
  gtag('event', name, params)
}

function sendConversion() {
  if (!hasAdvertisingConsent()) return
  gtag('event', 'conversion', {
    send_to: ADS_CONVERSION_ID,
    value: 1.0,
    currency: 'BRL',
  })
}

export type ToolName =
  | 'barcode_generator'
  | 'ean_generator'
  | 'qr_code_generator'
  | 'pix_generator'
  | 'barcode_reader'
  | 'sku_generator'

export function trackGenerate(tool: ToolName, format: string) {
  sendEvent('generate', { tool, format })
  sendConversion()
}

export function trackBatchGenerate(tool: ToolName, format: string, count: number) {
  sendEvent('batch_generate', { tool, format, count })
  sendConversion()
}

export function trackDownload(tool: ToolName, format: string, fileType: string) {
  sendEvent('download', { tool, format, file_type: fileType })
  sendConversion()
}

export function trackScan(format: string) {
  sendEvent('scan', { tool: 'barcode_reader' satisfies ToolName, format })
  sendConversion()
}

export function trackPrint(tool: ToolName, layout: string) {
  sendEvent('print_labels', { tool, layout })
  sendConversion()
}

export function trackCopy(tool: ToolName, contentType: string) {
  sendEvent('copy', { tool, content_type: contentType })
  sendConversion()
}
