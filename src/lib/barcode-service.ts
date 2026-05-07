/**
 * BarcodeService — extrai a lógica de domínio do BarcodeGenerator.
 *
 * Responsabilidades:
 * - Validação por formato (EAN check digit, regras por tipo)
 * - Renderização em SVGSVGElement detachado
 * - Geração em lote (sem DOM query — retorna elementos prontos)
 * - Hint de dígito verificador
 *
 * O serviço recebe jsbarcode como dependência porque a lib é carregada de
 * forma assíncrona pelo componente. Isso permite testes sem dynamic import.
 */

import { calculateEan13CheckDigit, calculateEan8CheckDigit } from '@/lib/ean-check-digit'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type BarcodeFormat =
  | 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39' | 'CODE93'
  | 'UPC' | 'UPCE' | 'ITF14' | 'MSI' | 'codabar' | 'pharmacode' | 'ISBN'

export type ValidationResult =
  | { valid: true; resolved: string }
  | { valid: false; error: string }

export interface RenderOptions {
  lineColor?: string
  background?: string
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  margin?: number
}

export interface CheckDigitHint {
  checkDigit: string
  fullCode: string
}

export interface BatchItem {
  id: string
  value: string
  svgElement?: SVGSVGElement  // presente quando geração foi bem-sucedida
  error?: string
}

export interface GenerateResult {
  value: string
  svgElement: SVGSVGElement
  /** Serializa para string — útil para ZIP/PDF sem referência ao DOM. */
  toSvgString(): string
}

type JsBarcodeFn = (
  element: SVGSVGElement | string | null,
  data: string,
  options?: Record<string, unknown>,
) => void

// ---------------------------------------------------------------------------
// Regras por formato
// ---------------------------------------------------------------------------

function resolveForFormat(raw: string, format: BarcodeFormat): string {
  const trimmed = raw.trim()
  if (format === 'EAN13' && /^\d{12}$/.test(trimmed)) {
    return trimmed + calculateEan13CheckDigit(trimmed)
  }
  if (format === 'EAN8' && /^\d{7}$/.test(trimmed)) {
    return trimmed + calculateEan8CheckDigit(trimmed)
  }
  return trimmed
}

// ---------------------------------------------------------------------------
// Implementação
// ---------------------------------------------------------------------------

export interface BarcodeService {
  validate(raw: string, format: BarcodeFormat): ValidationResult
  /** Renderiza em um elemento já existente no DOM (single mode). Retorna o valor resolvido. */
  renderInto(target: SVGSVGElement, raw: string, format: BarcodeFormat, options?: RenderOptions): string
  generate(raw: string, format: BarcodeFormat, options?: RenderOptions): GenerateResult
  generateBatch(lines: string[], format: BarcodeFormat, options?: RenderOptions): BatchItem[]
  getCheckDigitHint(raw: string, format: BarcodeFormat): CheckDigitHint | null
}

export function createBarcodeService(renderFn: JsBarcodeFn): BarcodeService {
  function renderToSvg(value: string, format: BarcodeFormat, options: RenderOptions = {}): SVGSVGElement {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement
    renderFn(el, value, {
      format,
      lineColor: options.lineColor ?? '#000000',
      background: options.background ?? '#ffffff',
      width: options.width ?? 2,
      height: options.height ?? 80,
      displayValue: options.displayValue ?? true,
      fontSize: options.fontSize ?? 14,
      margin: options.margin ?? 10,
    })
    return el
  }

  return {
    renderInto(target, raw, format, options) {
      const resolved = resolveForFormat(raw, format)
      renderFn(target, resolved, {
        format,
        lineColor: options?.lineColor ?? '#000000',
        background: options?.background ?? '#ffffff',
        width: options?.width ?? 2,
        height: options?.height ?? 80,
        displayValue: options?.displayValue ?? true,
        fontSize: options?.fontSize ?? 14,
        margin: options?.margin ?? 10,
      })
      return resolved
    },

    validate(raw, format) {
      const resolved = resolveForFormat(raw, format)
      if (!resolved) return { valid: false, error: 'Digite um valor para o código de barras.' }
      try {
        renderToSvg(resolved, format)
        return { valid: true, resolved }
      } catch {
        return { valid: false, error: 'Valor inválido para o formato selecionado.' }
      }
    },

    generate(raw, format, options) {
      const resolved = resolveForFormat(raw, format)
      const svgElement = renderToSvg(resolved, format, options)
      return {
        value: resolved,
        svgElement,
        toSvgString() {
          return new XMLSerializer().serializeToString(svgElement)
        },
      }
    },

    generateBatch(lines, format, options) {
      return lines.map((line, i) => {
        const resolved = resolveForFormat(line.trim(), format)
        const id = `${Date.now()}-${i}`
        try {
          const svgElement = renderToSvg(resolved, format, options)
          return { id, value: resolved, svgElement }
        } catch {
          return { id, value: resolved, error: `Valor inválido: ${resolved}` }
        }
      })
    },

    getCheckDigitHint(raw, format) {
      if (format !== 'EAN13' && format !== 'EAN8') return null
      if (!/^\d+$/.test(raw)) return null
      if (format === 'EAN13' && raw.length === 12) {
        const checkDigit = calculateEan13CheckDigit(raw)
        return { checkDigit, fullCode: raw + checkDigit }
      }
      if (format === 'EAN8' && raw.length === 7) {
        const checkDigit = calculateEan8CheckDigit(raw)
        return { checkDigit, fullCode: raw + checkDigit }
      }
      return null
    },
  }
}
