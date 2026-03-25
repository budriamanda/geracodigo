'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { downloadSvgFromElement, downloadPngFromElement } from '@/lib/download'
import { calculateEan13CheckDigit, calculateEan8CheckDigit } from '@/lib/ean-check-digit'
import { addToHistory } from '@/lib/barcode-history'
import { trackGenerate, trackDownload } from '@/lib/analytics'

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
  const [isExporting, setIsExporting] = useState(false)
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
    } catch {
      setError(`Valor inválido para ${format}. Verifique o número de dígitos.`)
      setGenerated(false)
    }
  }, [resolveInput, format])

  const downloadSvg = () => {
    if (svgRef.current) {
      downloadSvgFromElement(svgRef.current, `${format.toLowerCase()}-barcode.svg`)
      trackDownload('ean_generator', format, 'svg')
    }
  }

  const downloadPng = async () => {
    if (!svgRef.current) return
    setIsExporting(true)
    try {
      await downloadPngFromElement(svgRef.current, `${format.toLowerCase()}-barcode.png`)
      trackDownload('ean_generator', format, 'png')
    } catch {
      setError('Erro ao gerar PNG. Tente baixar em SVG.')
    } finally {
      setIsExporting(false)
    }
  }

  const downloadPdf = async () => {
    if (!svgRef.current) return
    setIsExporting(true)
    try {
      const jsPDF = (await import('jspdf')).jsPDF
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const svgStr = new XMLSerializer().serializeToString(svgRef.current)
      const canvas = document.createElement('canvas')
      canvas.width = 800
      canvas.height = 300
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const imageLoaded = await new Promise<boolean>((resolve) => {
        const img = new Image()
        const blob = new Blob([svgStr], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        img.onload = () => {
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, 800, 300)
          ctx.drawImage(img, 0, 0, 800, 300)
          URL.revokeObjectURL(url)
          resolve(true)
        }
        img.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
        img.src = url
      })

      if (!imageLoaded) {
        setError('Erro ao gerar PDF. Tente baixar em PNG ou SVG.')
        return
      }

      const imgData = canvas.toDataURL('image/png')
      doc.addImage(imgData, 'PNG', 65, 20, 80, 30)
      doc.save(`${format.toLowerCase()}-barcode.pdf`)
      trackDownload('ean_generator', format, 'pdf')
    } catch {
      setError('Erro ao gerar PDF. Tente baixar em PNG ou SVG.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex gap-4">
        {(['EAN13', 'EAN8'] as const).map(f => (
          <label key={f} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {checkDigitHint && (
          <p className="text-green-600 text-xs mt-1">{checkDigitHint}</p>
        )}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <button
        onClick={generate}
        disabled={!barcodeReady}
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {barcodeReady ? `Gerar ${format === 'EAN13' ? 'EAN-13' : 'EAN-8'}` : 'Carregando…'}
      </button>

      <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex flex-col items-center gap-4 min-h-[160px] justify-center">
        <svg ref={svgRef} className={generated ? '' : 'hidden'} aria-label={`Código de barras ${format} gerado`} role="img" />
        {!generated && <p className="text-gray-400 text-sm">O código aparecerá aqui</p>}
      </div>

      {generated && (
        <div className="grid grid-cols-3 gap-2">
          <button onClick={downloadPng} disabled={isExporting} aria-label="Baixar PNG" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">PNG</button>
          <button onClick={downloadSvg} disabled={isExporting} aria-label="Baixar SVG" className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50">SVG</button>
          <button onClick={downloadPdf} disabled={isExporting} aria-label="Baixar PDF" className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50">{isExporting ? 'Gerando…' : 'PDF'}</button>
        </div>
      )}
    </div>
  )
}
