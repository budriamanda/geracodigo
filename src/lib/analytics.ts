import { hasAnalyticsConsent } from '@/lib/consent'

type GtagFn = (...args: unknown[]) => void

function gtag(...args: unknown[]) {
  const w = window as unknown as { gtag?: GtagFn }
  if (typeof w.gtag === 'function') {
    w.gtag(...args)
  }
}

function sendEvent(name: string, params: Record<string, unknown>) {
  if (!hasAnalyticsConsent()) return
  gtag('event', name, params)
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
}

export function trackBatchGenerate(tool: ToolName, format: string, count: number) {
  sendEvent('batch_generate', { tool, format, count })
}

export function trackDownload(tool: ToolName, format: string, fileType: string) {
  sendEvent('download', { tool, format, file_type: fileType })
}

export function trackScan(format: string) {
  sendEvent('scan', { tool: 'barcode_reader' satisfies ToolName, format })
}

export function trackPrint(tool: ToolName, layout: string) {
  sendEvent('print_labels', { tool, layout })
}

export function trackCopy(tool: ToolName, contentType: string) {
  sendEvent('copy', { tool, content_type: contentType })
}
