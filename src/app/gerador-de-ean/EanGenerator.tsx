'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { downloadSvgFromElement, downloadPngFromElement, exportSvgsToPdf } from '@/lib/download'
import { showToast } from '@/components/Toast'
import { calculateEan13CheckDigit, calculateEan8CheckDigit } from '@/lib/ean-check-digit'
import { addToHistory } from '@/lib/barcode-history'
import { trackGenerate, trackDownload } from '@/lib/analytics'
import { incrementCount } from '@/lib/counter'
import ExportActions from '@/components/ExportActions'
import PreviewArea from '@/components/ui/PreviewArea'
import PrivacyChip from '@/components/ui/PrivacyChip'

type JsBarcodeFn = (
  element: SVGSVGElement | string | null,
  data: string,
  options?: Record<string, unknown>,
) => void

export default function EanGenerator() {
  const [input, setInput] = useState('')
  const [format, setFormat] = useState<'EAN13' | 'EAN8'>('EAN13')
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)
  const [checkDigitHint, setCheckDigitHint] = useState('')
  const [exportingFormat, setExportingFormat] = useState<'png' | 'pdf' | null>(null)
  const [barcodeReady, setBarcodeReady] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const jsBarcodeRef = useRef<JsBarcodeFn | null>(null)

  useEffect(() => {
    import('jsbarcode').then(mod => {
      jsBarcodeRef.current = mod.default as JsBarcodeFn
      setBarcodeReady(true)
    })
  }, [])

  const expectedDigits = format === 'EAN13' ? 13 : 8
  const shortDigits = format === 'EAN13' ? 12 : 7

  useEffect(() => {
    if (/^\d+$/.test(input) && input.length === shortDigits) {
      const cd = format === 'EAN13'
        ? calculateEan13CheckDigit(input)
        : calculateEan8CheckDigit(input)
      setCheckDigitHint(`Dígito verificador calculado: ${cd}. Código completo: ${input}${cd}`)
    } else {
      setCheckDigitHint('')
    }
  }, [input, format, shortDigits])

  const resolveInput = useCallback((): string => {
    const trimmed = input.trim()
    if (/^\d+$/.test(trimmed) && trimmed.length === shortDigits) {
      const cd = format === 'EAN13'
        ? calculateEan13CheckDigit(trimmed)
        : calculateEan8CheckDigit(trimmed)
      return trimmed + cd
    }
    return trimmed
  }, [input, format, shortDigits])

  const generate = useCallback(() => {
    if (!jsBarcodeRef.current || !svgRef.current) { setError('Carregando gerador… tente novamente em instantes.'); return }
    const val = resolveInput()
    if (!val) { setError('Digite o número EAN.'); return }
    try {
      jsBarcodeRef.current(svgRef.current, val, {
        format,
        lineColor: '#000',
        width: 2,
        height: 80,
        displayValue: true,
      })
      setGenerated(true)
      setError('')
      addToHistory(val, format)
      trackGenerate('ean_generator', format)
      incrementCount()
    } catch {
      setError(`Valor inválido para ${format}. Verifique o número de dígitos.`)
      setGenerated(false)
    }
  }, [resolveInput, format])

  const downloadSvg = () => {
    if (svgRef.current) {
      downloadSvgFromElement(svgRef.current, `${format.toLowerCase()}-barcode.svg`)
      trackDownload('ean_generator', format, 'svg')
      showToast('Download iniciado — SVG', 'success')
    }
  }

  const downloadPng = async () => {
    if (!svgRef.current) return
    setExportingFormat('png')
    try {
      await downloadPngFromElement(svgRef.current, `${format.toLowerCase()}-barcode.png`)
      trackDownload('ean_generator', format, 'png')
      showToast('Download iniciado — PNG', 'success')
    } catch {
      setError('Erro ao gerar PNG. Tente baixar em SVG.')
    } finally {
      setExportingFormat(null)
    }
  }

  const downloadPdf = async () => {
    if (!svgRef.current) return
    setExportingFormat('pdf')
    try {
      await exportSvgsToPdf([svgRef.current], `${format.toLowerCase()}-barcode.pdf`)
      trackDownload('ean_generator', format, 'pdf')
      showToast('Download iniciado — PDF', 'success')
    } catch {
      setError('Erro ao gerar PDF. Tente baixar em PNG ou SVG.')
    } finally {
      setExportingFormat(null)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex gap-4" role="radiogroup" aria-label="Formato EAN">
          {(['EAN13', 'EAN8'] as const).map(f => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ean-format"
                value={f}
                checked={format === f}
                onChange={() => { setFormat(f); setInput(''); setGenerated(false); setError('') }}
                className="accent-indigo-600"
              />
              <span className="font-medium text-sm">{f === 'EAN13' ? 'EAN-13 (13 dígitos)' : 'EAN-8 (8 dígitos)'}</span>
            </label>
          ))}
        </div>

        <div>
          <label htmlFor="ean-input" className="block text-sm font-medium text-gray-700 mb-1">
            Número ({expectedDigits} dígitos ou {shortDigits} para cálculo automático)
          </label>
          <input
            id="ean-input"
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value.replace(/\D/g, '')); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') generate() }}
            placeholder={format === 'EAN13' ? '789123456789 ou 7891234567890' : '1234567 ou 12345670'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={expectedDigits}
            aria-describedby={checkDigitHint ? 'ean-check-digit-hint' : undefined}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {checkDigitHint && (
            <p id="ean-check-digit-hint" className="text-green-600 text-xs mt-1">{checkDigitHint}</p>
          )}
          {error && <p className="text-red-600 text-xs mt-1" role="alert">{error}</p>}
        </div>

        <button
          onClick={generate}
          disabled={!barcodeReady}
          className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {barcodeReady ? `Gerar ${format === 'EAN13' ? 'EAN-13' : 'EAN-8'}` : 'Carregando…'}
        </button>
        <PrivacyChip />
      </div>

      {/* Preview */}
      <PreviewArea
        title="Preview do código"
        hasContent={true}
        ariaLiveText={generated ? `Código ${format === 'EAN13' ? 'EAN-13' : 'EAN-8'} gerado com sucesso` : ''}
      >
        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex flex-col items-center gap-4 min-h-[160px] justify-center w-full">
          <svg ref={svgRef} className={generated ? 'animate-fade-in' : 'hidden'} aria-label={`Código de barras ${format} gerado`} role="img" />
          {!generated && (
            <p className="text-gray-400 text-sm text-center px-4">O código aparecerá aqui</p>
          )}
        </div>
        {generated && (
          <div className="w-full">
            <ExportActions
              disabled={exportingFormat !== null}
              actions={[
                { label: 'PNG', ariaLabel: 'Baixar PNG', onClick: downloadPng, variant: 'primary', loading: exportingFormat === 'png' },
                { label: 'SVG', ariaLabel: 'Baixar SVG', onClick: downloadSvg, variant: 'secondary' },
                { label: 'PDF', ariaLabel: 'Baixar PDF', onClick: downloadPdf, variant: 'secondary', loading: exportingFormat === 'pdf', loadingLabel: 'Gerando…' },
              ]}
            />
          </div>
        )}
      </PreviewArea>
    </div>
  )
}
