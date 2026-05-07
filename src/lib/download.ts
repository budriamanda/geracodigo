/**
 * download.ts — API unificada para exportação de SVGs.
 *
 * Interface principal:
 *   downloadSvg(element, format, options?)   → SVG/PNG/PDF a partir de um SVGSVGElement
 *   downloadSvgBatch(elements, format, options?) → lote de SVGs
 *
 * Escape hatches para callers com dado já pronto:
 *   downloadDataUrl(dataUrl, filename)
 *   downloadBlob(blob, filename)
 *
 * Funções puras (testáveis sem DOM):
 *   serializeSvg(element)
 *   resolveSvgDimensions(element, fallback?)
 */

// ---------------------------------------------------------------------------
// Funções utilitárias internas
// ---------------------------------------------------------------------------

function triggerSave(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ---------------------------------------------------------------------------
// Funções puras — testáveis sem jsdom completo
// ---------------------------------------------------------------------------

export function serializeSvg(element: SVGSVGElement): string {
  return new XMLSerializer().serializeToString(element)
}

export function resolveSvgDimensions(
  element: SVGSVGElement,
  fallback = { width: 300, height: 150 },
): { width: number; height: number } {
  let w = element.width.baseVal.value
  let h = element.height.baseVal.value
  if (!w || !h) {
    try {
      const bbox = element.getBBox()
      w = w || bbox.width + bbox.x * 2
      h = h || bbox.height + bbox.y * 2
    } catch {
      // getBBox() lança em alguns browsers quando elemento não está no DOM
    }
  }
  if (!w) w = parseFloat(element.getAttribute('width') ?? '0') || fallback.width
  if (!h) h = parseFloat(element.getAttribute('height') ?? '0') || fallback.height
  return { width: Math.max(w, 1), height: Math.max(h, 1) }
}

// ---------------------------------------------------------------------------
// Pipeline SVG → canvas → PNG (interno)
// ---------------------------------------------------------------------------

async function svgElementToDataUrl(
  svg: SVGSVGElement,
  bgColor: string,
  scale: number,
): Promise<string> {
  const { width: svgW, height: svgH } = resolveSvgDimensions(svg)
  const width = Math.round(svgW * scale)
  const height = Math.round(svgH * scale)

  const svgStr = serializeSvg(svg)
  const blob = new Blob([svgStr], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível criar o contexto do canvas'))
      return
    }
    const img = new Image()
    img.onload = () => {
      try {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/png'))
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao converter SVG para PNG'))
    }
    img.src = url
  })
}

// ---------------------------------------------------------------------------
// API principal
// ---------------------------------------------------------------------------

export interface DownloadOptions {
  filename?: string
  bgColor?: string
  /** Fator de escala para PNG (default: 2). */
  scale?: number
}

/**
 * Baixa um único SVGSVGElement no formato indicado.
 * Esconde: getBBox fallback, revokeObjectURL determinístico, pipeline canvas.
 */
export async function downloadSvg(
  element: SVGSVGElement,
  format: 'svg' | 'png' | 'pdf',
  options: DownloadOptions = {},
): Promise<void> {
  const { filename = 'barcode', bgColor = '#ffffff', scale = 2 } = options

  switch (format) {
    case 'svg': {
      const blob = new Blob([serializeSvg(element)], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      try { triggerSave(url, `${filename}.svg`) } finally { URL.revokeObjectURL(url) }
      break
    }
    case 'png': {
      const dataUrl = await svgElementToDataUrl(element, bgColor, scale)
      triggerSave(dataUrl, `${filename}.png`)
      break
    }
    case 'pdf': {
      await exportSvgsToPdf([element], `${filename}.pdf`, bgColor)
      break
    }
  }
}

export interface BatchDownloadOptions {
  filename?: string
  bgColor?: string
  orientation?: 'portrait' | 'landscape'
}

/**
 * Baixa um lote de SVGSVGElement no formato indicado.
 * - 'svg' → ZIP com um .svg por elemento
 * - 'png' → ZIP com um .png por elemento
 * - 'pdf' → PDF multi-página
 */
export async function downloadSvgBatch(
  elements: SVGSVGElement[],
  format: 'svg' | 'png' | 'pdf',
  options: BatchDownloadOptions = {},
): Promise<void> {
  const { filename = 'codigos', bgColor = '#ffffff' } = options

  if (format === 'pdf') {
    await exportSvgsToPdf(elements, `${filename}.pdf`, bgColor)
    return
  }

  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const nameCount = new Map<string, number>()

  for (const svg of elements) {
    const val = svg.getAttribute('data-batch-value') ?? 'barcode'
    const count = nameCount.get(val) ?? 0
    nameCount.set(val, count + 1)
    const base = count === 0 ? val : `${val}_${count}`

    if (format === 'svg') {
      zip.file(`${base}.svg`, serializeSvg(svg))
    } else {
      const dataUrl = await svgElementToDataUrl(svg, bgColor, 2)
      const b64 = dataUrl.split(',')[1]
      zip.file(`${base}.png`, b64, { base64: true })
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${filename}.zip`)
}

// ---------------------------------------------------------------------------
// Escape hatches — para callers com dado já pronto
// ---------------------------------------------------------------------------

export function downloadDataUrl(dataUrl: string, filename: string): void {
  triggerSave(dataUrl, filename)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  try { triggerSave(url, filename) } finally { URL.revokeObjectURL(url) }
}

// ---------------------------------------------------------------------------
// PDF multi-página (compartilhado por downloadSvg e downloadSvgBatch)
// ---------------------------------------------------------------------------

export async function exportSvgsToPdf(
  svgs: SVGSVGElement[],
  filename: string,
  bgColor = '#ffffff',
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  let y = 15
  const pageW = 210
  const maxW = 120
  const margins = 30

  for (const svg of svgs) {
    const { width: svgW, height: svgH } = resolveSvgDimensions(svg)
    const aspect = svgH / svgW

    const barcodeW = Math.min(maxW, pageW - margins)
    const barcodeH = barcodeW * aspect

    if (y + barcodeH + 10 > 280) {
      doc.addPage()
      y = 15
    }

    const renderScale = Math.max(1, Math.ceil(800 / svgW))
    const dataUrl = await svgElementToDataUrl(svg, bgColor, renderScale)

    const x = (pageW - barcodeW) / 2
    doc.addImage(dataUrl, 'PNG', x, y, barcodeW, barcodeH)
    y += barcodeH + 8
  }

  doc.save(filename)
}

// ---------------------------------------------------------------------------
// Shims de compatibilidade — chamadas legadas em BarcodeGenerator / EanGenerator
// ---------------------------------------------------------------------------

/** @deprecated Use downloadSvg(element, 'svg', { filename }) */
export function downloadSvgFromElement(element: SVGSVGElement, filename: string): void {
  const blob = new Blob([serializeSvg(element)], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  try { triggerSave(url, filename) } finally { URL.revokeObjectURL(url) }
}

/** @deprecated Use downloadSvg(element, 'png', { filename, bgColor, scale }) */
export function downloadPngFromElement(
  svgElement: SVGSVGElement,
  filename: string,
  scale = 2,
  bgColor = '#ffffff',
): Promise<void> {
  return downloadSvg(svgElement, 'png', { filename: filename.replace(/\.png$/, ''), bgColor, scale })
}

/** @deprecated Use svgElementToDataUrl internamente */
export async function svgToDataUrl(
  svg: SVGSVGElement,
  bgColor = '#ffffff',
  width = 800,
  height = 300,
): Promise<string | null> {
  try {
    // Usa as dimensões passadas (compat com callers que já calcularam o tamanho)
    const svgStr = serializeSvg(svg)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const loaded = await new Promise<boolean>((resolve) => {
      const img = new Image()
      img.onload = () => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        resolve(true)
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
      img.src = url
    })

    return loaded ? canvas.toDataURL('image/png') : null
  } catch {
    return null
  }
}
