'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { downloadSvgFromElement, downloadPngFromElement, downloadBlob } from '@/lib/download'
import { calculateEan13CheckDigit, calculateEan8CheckDigit } from '@/lib/ean-check-digit'
import { addToHistory, getHistory, removeFromHistory, clearHistory, type BarcodeHistoryItem } from '@/lib/barcode-history'
import { trackGenerate, trackBatchGenerate, trackDownload, trackPrint } from '@/lib/analytics'
import ConfirmDialog from '@/components/ConfirmDialog'

type JsBarcodeFn = (
  element: SVGSVGElement | string | null,
  data: string,
  options?: Record<string, unknown>,
) => void

const FORMATS = [
  { value: 'EAN13', label: 'EAN-13', placeholder: '7891234567890', hint: '13 dígitos' },
  { value: 'EAN8', label: 'EAN-8', placeholder: '12345670', hint: '8 dígitos' },
  { value: 'CODE128', label: 'Code 128', placeholder: 'GeraCode2026', hint: 'Texto alfanumérico' },
  { value: 'CODE39', label: 'Code 39', placeholder: 'GERACODE', hint: 'Letras maiúsculas e números' },
  { value: 'CODE93', label: 'Code 93', placeholder: 'GERACODE93', hint: 'Alfanumérico compacto' },
  { value: 'UPC', label: 'UPC-A', placeholder: '012345678905', hint: '12 dígitos' },
  { value: 'UPCE', label: 'UPC-E', placeholder: '01234565', hint: '8 dígitos' },
  { value: 'ITF14', label: 'ITF-14', placeholder: '98249880215005', hint: '14 dígitos' },
  { value: 'MSI', label: 'MSI Plessey', placeholder: '1234567', hint: 'Números' },
  { value: 'codabar', label: 'Codabar', placeholder: 'A12345B', hint: 'Começa/termina com A-D' },
  { value: 'pharmacode', label: 'Pharmacode', placeholder: '1234', hint: '3-131070' },
  { value: 'ISBN', label: 'ISBN', placeholder: '9781234567897', hint: '13 dígitos (978/979)' },
]

type Tab = 'single' | 'batch' | 'history'

const inputBase = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors'
const inputNormal = `${inputBase} border-gray-300 focus:ring-indigo-500`

export default function BarcodeGenerator() {
  const [tab, setTab] = useState<Tab>('single')
  const [input, setInput] = useState('')
  const [batchInput, setBatchInput] = useState('')
  const [format, setFormat] = useState('CODE128')
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)
  const [checkDigitHint, setCheckDigitHint] = useState('')

  const [barHeight, setBarHeight] = useState(80)
  const [barWidth, setBarWidth] = useState(2)
  const [lineColor, setLineColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [showText, setShowText] = useState(true)
  const [fontSize, setFontSize] = useState(14)

  const [batchResults, setBatchResults] = useState<{ id: string; value: string; error?: string }[]>([])

  const [history, setHistoryState] = useState<BarcodeHistoryItem[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [barcodeReady, setBarcodeReady] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const batchContainerRef = useRef<HTMLDivElement>(null)
  const jsBarcodeRef = useRef<JsBarcodeFn | null>(null)

  useEffect(() => {
    import('jsbarcode').then(mod => {
      jsBarcodeRef.current = mod.default as JsBarcodeFn
      setBarcodeReady(true)
    })
  }, [])

  useEffect(() => {
    if (tab === 'history') setHistoryState(getHistory())
  }, [tab])

  const currentFormat = FORMATS.find(f => f.value === format)

  useEffect(() => {
    if ((format === 'EAN13' || format === 'EAN8') && /^\d+$/.test(input)) {
      if (format === 'EAN13' && input.length === 12) {
        const cd = calculateEan13CheckDigit(input)
        setCheckDigitHint(`Dígito verificador: ${cd} (código completo: ${input}${cd})`)
      } else if (format === 'EAN8' && input.length === 7) {
        const cd = calculateEan8CheckDigit(input)
        setCheckDigitHint(`Dígito verificador: ${cd} (código completo: ${input}${cd})`)
      } else {
        setCheckDigitHint('')
      }
    } else {
      setCheckDigitHint('')
    }
  }, [input, format])

  const getBarcodeOptions = useCallback(() => ({
    format,
    lineColor,
    background: bgColor,
    width: barWidth,
    height: barHeight,
    displayValue: showText,
    fontSize,
    margin: 10,
  }), [format, lineColor, bgColor, barWidth, barHeight, showText, fontSize])

  const resolveInput = useCallback((raw: string): string => {
    const trimmed = raw.trim()
    if (format === 'EAN13' && /^\d{12}$/.test(trimmed)) {
      return trimmed + calculateEan13CheckDigit(trimmed)
    }
    if (format === 'EAN8' && /^\d{7}$/.test(trimmed)) {
      return trimmed + calculateEan8CheckDigit(trimmed)
    }
    return trimmed
  }, [format])

  const generate = useCallback(() => {
    if (!jsBarcodeRef.current || !svgRef.current) { setError('Carregando gerador… tente novamente em instantes.'); return }
    const val = resolveInput(input)
    if (!val) { setError('Digite um valor para o código de barras.'); return }
    try {
      jsBarcodeRef.current(svgRef.current, val, getBarcodeOptions())
      setGenerated(true)
      setError('')
      addToHistory(val, format)
      trackGenerate('barcode_generator', format)
    } catch {
      setError('Valor inválido para o formato selecionado.')
      setGenerated(false)
    }
  }, [input, format, getBarcodeOptions, resolveInput])

  const MAX_BATCH = 200

  const generateBatch = useCallback(() => {
    if (!jsBarcodeRef.current) { setError('Carregando gerador… tente novamente em instantes.'); return }
    const lines = batchInput.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) { setError('Insira pelo menos um código.'); return }
    if (lines.length > MAX_BATCH) { setError(`Máximo de ${MAX_BATCH} códigos por vez. Você inseriu ${lines.length}.`); return }
    setError('')

    const renderBarcode = jsBarcodeRef.current
    const results = lines.map((line, i) => {
      const val = resolveInput(line)
      const id = `${Date.now()}-${i}`
      const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement
      try {
        renderBarcode(tempSvg, val, getBarcodeOptions())
        return { id, value: val }
      } catch {
        return { id, value: val, error: `Valor inválido: ${val}` }
      }
    })

    const successResults = results.filter(r => !r.error)
    if (successResults.length > 0) {
      addToHistory(successResults[0].value, format)
    }
    setBatchResults(results)
    trackBatchGenerate('barcode_generator', format, results.filter(r => !r.error).length)
  }, [batchInput, format, getBarcodeOptions, resolveInput])

  useEffect(() => {
    if (batchResults.length === 0 || !batchContainerRef.current || !jsBarcodeRef.current) return
    const renderBarcode = jsBarcodeRef.current
    const svgs = batchContainerRef.current.querySelectorAll<SVGSVGElement>('[data-batch-value]')
    svgs.forEach(el => {
      const val = el.getAttribute('data-batch-value')
      if (val) {
        try { renderBarcode(el, val, getBarcodeOptions()) } catch { /* skip */ }
      }
    })
  }, [batchResults, getBarcodeOptions])

  const downloadBatchZip = useCallback(async () => {
    if (!batchContainerRef.current) return
    setIsExporting(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const svgs = batchContainerRef.current.querySelectorAll<SVGSVGElement>('[data-batch-value]')

      for (const svg of svgs) {
        const val = svg.getAttribute('data-batch-value') ?? 'barcode'
        const svgStr = new XMLSerializer().serializeToString(svg)
        zip.file(`${val}.svg`, svgStr)
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, 'codigos-de-barras.zip')
      trackDownload('barcode_generator', format, 'zip')
    } catch {
      setError('Erro ao gerar ZIP. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }, [format])

  const downloadPdf = useCallback(async () => {
    setIsExporting(true)
    try {
      const jsPDF = (await import('jspdf')).jsPDF
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const svgs = tab === 'batch'
        ? batchContainerRef.current?.querySelectorAll<SVGSVGElement>('[data-batch-value]') ?? []
        : svgRef.current ? [svgRef.current] : []

      let y = 15
      const pageW = 210
      const barcodeW = 80
      const barcodeH = 30

      for (const svg of svgs) {
        if (y + barcodeH + 10 > 280) {
          doc.addPage()
          y = 15
        }
        const svgStr = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 300
        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        const loaded = await new Promise<boolean>((resolve) => {
          const img = new Image()
          const blob = new Blob([svgStr], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)
          img.onload = () => {
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, 800, 300)
            ctx.drawImage(img, 0, 0, 800, 300)
            URL.revokeObjectURL(url)
            resolve(true)
          }
          img.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
          img.src = url
        })

        if (!loaded) continue

        const imgData = canvas.toDataURL('image/png')
        const x = (pageW - barcodeW) / 2
        doc.addImage(imgData, 'PNG', x, y, barcodeW, barcodeH)
        y += barcodeH + 8
      }

      doc.save('codigos-de-barras.pdf')
      trackDownload('barcode_generator', format, 'pdf')
    } catch {
      setError('Erro ao gerar PDF. Tente baixar em outro formato.')
    } finally {
      setIsExporting(false)
    }
  }, [tab, bgColor, format])

  const printLabels = useCallback((cols: number, rows: number) => {
    const svgs = tab === 'batch'
      ? batchContainerRef.current?.querySelectorAll<SVGSVGElement>('[data-batch-value]') ?? []
      : svgRef.current ? [svgRef.current] : []

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setError('O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente novamente.')
      return
    }

    const svgHtmls = Array.from(svgs).map(svg =>
      new XMLSerializer().serializeToString(svg)
    )

    const cellW = Math.floor(100 / cols)
    const perPage = cols * rows
    const pages: string[] = []

    for (let i = 0; i < svgHtmls.length; i += perPage) {
      const pageItems = svgHtmls.slice(i, i + perPage)
      const gridHtml = pageItems.map(s =>
        `<div style="width:${cellW}%;padding:4mm;box-sizing:border-box;display:flex;align-items:center;justify-content:center">${s}</div>`
      ).join('')
      pages.push(`<div class="grid page">${gridHtml}</div>`)
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Etiquetas - GeraCode</title>
<style>
@media print{@page{margin:5mm}.page{page-break-after:always}.page:last-child{page-break-after:auto}}
body{font-family:sans-serif;margin:0;padding:5mm}
.grid{display:flex;flex-wrap:wrap}
svg{max-width:100%;height:auto}
</style></head><body>
${pages.join('\n')}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`)
    printWindow.document.close()
    trackPrint('barcode_generator', `${cols}x${rows}`)
  }, [tab])

  const downloadSvg = () => {
    if (svgRef.current) {
      downloadSvgFromElement(svgRef.current, 'codigo-de-barras.svg')
      trackDownload('barcode_generator', format, 'svg')
    }
  }
  const downloadPng = async () => {
    if (svgRef.current) {
      try {
        await downloadPngFromElement(svgRef.current, 'codigo-de-barras.png')
        trackDownload('barcode_generator', format, 'png')
      } catch {
        setError('Erro ao gerar PNG. Tente baixar em SVG.')
      }
    }
  }

  const handleHistoryClick = (item: BarcodeHistoryItem) => {
    setInput(item.value)
    setFormat(item.format)
    setTab('single')
  }

  const handleRemoveHistory = (id: string) => {
    removeFromHistory(id)
    setHistoryState(getHistory())
  }

  const handleClearHistory = () => {
    setShowClearConfirm(true)
  }

  const confirmClearHistory = useCallback(() => {
    clearHistory()
    setHistoryState([])
    setShowClearConfirm(false)
  }, [])

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1" role="tablist" aria-label="Modo de geração">
        {([
          { id: 'single' as Tab, label: 'Individual' },
          { id: 'batch' as Tab, label: 'Em Lote' },
          { id: 'history' as Tab, label: 'Histórico' },
        ]).map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => { setTab(t.id); setError('') }}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Formato + Personalizacao (shared) */}
      {tab !== 'history' && (
        <section aria-label="Configuração do código de barras" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="barcode-format" className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
              <select
                id="barcode-format"
                value={format}
                onChange={e => { setFormat(e.target.value); setGenerated(false); setBatchResults([]); setError('') }}
                className={inputNormal}
              >
                {FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {currentFormat && (
                <p className="text-xs text-gray-400 mt-1">{currentFormat.hint}</p>
              )}
            </div>

            <div>
              <label htmlFor="bar-height" className="block text-sm font-medium text-gray-700 mb-1">
                Altura: {barHeight}px
              </label>
              <input
                id="bar-height"
                type="range"
                min={30}
                max={200}
                value={barHeight}
                onChange={e => setBarHeight(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="bar-width" className="block text-sm font-medium text-gray-700 mb-1">Largura barra</label>
              <select id="bar-width" value={barWidth} onChange={e => setBarWidth(Number(e.target.value))} className={inputNormal}>
                {[1, 2, 3, 4].map(w => <option key={w} value={w}>{w}px</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
              <select id="font-size" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className={inputNormal}>
                {[10, 12, 14, 16, 18, 20].map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="line-color" className="block text-sm font-medium text-gray-700 mb-1">Cor barras</label>
              <div className="flex items-center gap-2">
                <input id="line-color" type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="h-8 w-10 rounded border border-gray-300 cursor-pointer" />
                <span className="text-xs text-gray-500 font-mono">{lineColor}</span>
              </div>
            </div>

            <div>
              <label htmlFor="bg-color" className="block text-sm font-medium text-gray-700 mb-1">Cor fundo</label>
              <div className="flex items-center gap-2">
                <input id="bg-color" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 w-10 rounded border border-gray-300 cursor-pointer" />
                <span className="text-xs text-gray-500 font-mono">{bgColor}</span>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showText}
              onChange={e => setShowText(e.target.checked)}
              className="accent-indigo-600 w-4 h-4"
            />
            <span className="text-sm text-gray-700">Mostrar texto abaixo do código</span>
          </label>
        </section>
      )}

      {/* Single mode */}
      {tab === 'single' && (
        <div id="panel-single" role="tabpanel" aria-labelledby="tab-single" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="barcode-value" className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input
              id="barcode-value"
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') generate() }}
              placeholder={currentFormat?.placeholder ?? 'Digite o valor...'}
              className={inputNormal}
            />
            {checkDigitHint && (
              <p className="text-green-600 text-xs mt-1">{checkDigitHint}</p>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <button
            onClick={generate}
            disabled={!barcodeReady}
            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50"
          >
            {barcodeReady ? 'Gerar Código de Barras' : 'Carregando gerador…'}
          </button>

          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex flex-col items-center gap-4 min-h-[160px] justify-center">
            <svg ref={svgRef} className={generated ? '' : 'hidden'} aria-label={`Código de barras ${format} gerado`} role="img" />
            {!generated && (
              <p className="text-gray-400 text-sm">O código de barras aparecerá aqui</p>
            )}
          </div>

          {generated && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={downloadPng}
                  disabled={isExporting}
                  aria-label="Baixar PNG"
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  PNG
                </button>
                <button
                  onClick={downloadSvg}
                  disabled={isExporting}
                  aria-label="Baixar SVG"
                  className="bg-white border border-indigo-600 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  SVG
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={isExporting}
                  aria-label="Baixar PDF"
                  className="bg-white border border-indigo-600 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  {isExporting ? 'Gerando…' : 'PDF'}
                </button>
                <button
                  onClick={() => printLabels(3, 5)}
                  disabled={isExporting}
                  aria-label="Imprimir etiquetas"
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Imprimir
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch mode */}
      {tab === 'batch' && (
        <div id="panel-batch" role="tabpanel" aria-labelledby="tab-batch" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="batch-input" className="block text-sm font-medium text-gray-700 mb-1">
              Códigos (um por linha)
            </label>
            <textarea
              id="batch-input"
              value={batchInput}
              onChange={e => setBatchInput(e.target.value)}
              placeholder={`${currentFormat?.placeholder ?? '123456'}\n${currentFormat?.placeholder ?? '789012'}\n...`}
              className={`${inputNormal} h-32 resize-none font-mono`}
            />
            <p className="text-xs text-gray-400 mt-1">
              Cole do Excel ou digite um código por linha (máx. {MAX_BATCH}). Para EAN-13, você pode digitar 12 dígitos e o verificador será calculado.
            </p>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            onClick={generateBatch}
            disabled={!barcodeReady}
            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {barcodeReady ? 'Gerar Todos' : 'Carregando gerador…'}
          </button>

          {batchResults.length > 0 && (
            <>
              <div ref={batchContainerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {batchResults.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex flex-col items-center gap-2">
                    {r.error ? (
                      <p className="text-red-500 text-xs">{r.error}</p>
                    ) : (
                      <svg data-batch-value={r.value} aria-label={`Código ${r.value}`} role="img" />
                    )}
                    <span className="text-xs text-gray-500 font-mono">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={downloadBatchZip} disabled={isExporting} aria-label="Baixar lote em ZIP (SVG)" className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {isExporting ? 'Gerando…' : 'ZIP (SVG)'}
                </button>
                <button onClick={downloadPdf} disabled={isExporting} aria-label="Baixar lote em PDF" className="bg-white border border-indigo-600 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50">
                  {isExporting ? 'Gerando…' : 'PDF'}
                </button>
                <button onClick={() => printLabels(3, 5)} disabled={isExporting} aria-label="Imprimir etiquetas 3 colunas por 5 linhas" className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Etiquetas 3x5
                </button>
                <button onClick={() => printLabels(2, 5)} disabled={isExporting} aria-label="Imprimir etiquetas 2 colunas por 5 linhas" className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Etiquetas 2x5
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" className="bg-white rounded-xl border border-gray-200 p-6">
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum código gerado ainda. Os códigos aparecerão aqui automaticamente.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Últimos códigos gerados</h3>
                <button onClick={handleClearHistory} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                  Limpar tudo
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2 group">
                    <button
                      onClick={() => handleHistoryClick(item)}
                      className="flex-1 text-left flex items-center gap-3 min-w-0"
                    >
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono shrink-0">{item.format}</span>
                      <span className="text-sm text-gray-800 font-mono truncate">{item.value}</span>
                    </button>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      onClick={() => handleRemoveHistory(item.id)}
                      aria-label={`Remover ${item.value} do histórico`}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={showClearConfirm}
        title="Limpar histórico"
        message="Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita."
        confirmLabel="Limpar tudo"
        cancelLabel="Cancelar"
        onConfirm={confirmClearHistory}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
