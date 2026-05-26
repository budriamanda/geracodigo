'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { downloadSvg, downloadBlob, exportSvgsToPdf, serializeSvg } from '@/lib/download'
import { showToast } from '@/components/Toast'
import PrivacyChip from '@/components/ui/PrivacyChip'
import { incrementCount } from '@/lib/counter'
import { createBarcodeService, type BarcodeService, type BatchItem } from '@/lib/barcode-service'
import { addToHistory, getHistory, removeFromHistory, clearHistory, type BarcodeHistoryItem } from '@/lib/barcode-history'
import { trackGenerate, trackBatchGenerate, trackDownload, trackPrint, trackToolAttempt } from '@/lib/analytics'
import ConfirmDialog from '@/components/ConfirmDialog'
import ShareBlock from '@/components/ShareBlock'
import { getShareConfig } from '@/lib/share-config'

const SHARE = getShareConfig('gerador-de-codigo-de-barras')

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

const inputBase = 'w-full border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 transition-colors'
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

  const [batchResults, setBatchResults] = useState<BatchItem[]>([])

  const [history, setHistoryState] = useState<BarcodeHistoryItem[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [barcodeReady, setBarcodeReady] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const serviceRef = useRef<BarcodeService | null>(null)

  useEffect(() => {
    import('jsbarcode').then(mod => {
      serviceRef.current = createBarcodeService(mod.default as Parameters<typeof createBarcodeService>[0])
      setBarcodeReady(true)
    })
  }, [])

  useEffect(() => {
    if (tab === 'history') setHistoryState(getHistory())
  }, [tab])

  const currentFormat = FORMATS.find(f => f.value === format)

  const getRenderOptions = useCallback(() => ({
    lineColor,
    background: bgColor,
    width: barWidth,
    height: barHeight,
    displayValue: showText,
    fontSize,
    margin: 10,
  }), [lineColor, bgColor, barWidth, barHeight, showText, fontSize])

  useEffect(() => {
    if (!serviceRef.current) return
    const hint = serviceRef.current.getCheckDigitHint(input, format as Parameters<typeof serviceRef.current.getCheckDigitHint>[1])
    if (hint) {
      setCheckDigitHint(`Dígito verificador: ${hint.checkDigit} (código completo: ${hint.fullCode})`)
    } else {
      setCheckDigitHint('')
    }
  }, [input, format])

  const generate = useCallback(() => {
    trackToolAttempt('barcode_generator')
    if (!serviceRef.current || !svgRef.current) { setError('Carregando gerador… tente novamente em instantes.'); return }
    try {
      const resolved = serviceRef.current.renderInto(svgRef.current, input, format as Parameters<typeof serviceRef.current.renderInto>[2], getRenderOptions())
      if (!resolved) { setError('Digite um valor para o código de barras.'); return }
      setGenerated(true)
      setError('')
      addToHistory(resolved, format)
      trackGenerate('barcode_generator', format)
      incrementCount()
    } catch {
      setError('Valor inválido para o formato selecionado.')
      setGenerated(false)
    }
  }, [input, format, getRenderOptions])

  const MAX_BATCH = 200

  const generateBatch = useCallback(() => {
    if (!serviceRef.current) { setError('Carregando gerador… tente novamente em instantes.'); return }
    const lines = batchInput.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) { setError('Insira pelo menos um código.'); return }
    if (lines.length > MAX_BATCH) { setError(`Máximo de ${MAX_BATCH} códigos por vez. Você inseriu ${lines.length}.`); return }
    setError('')

    const results = serviceRef.current.generateBatch(
      lines,
      format as Parameters<typeof serviceRef.current.generateBatch>[1],
      getRenderOptions(),
    )

    for (const r of results.filter(r => !r.error)) {
      addToHistory(r.value, format)
    }
    setBatchResults(results)
    const successCount = results.filter(r => !r.error).length
    trackBatchGenerate('barcode_generator', format, successCount)
    incrementCount(successCount)
  }, [batchInput, format, getRenderOptions])

  const downloadBatchZip = useCallback(async () => {
    setIsExporting(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const nameCount = new Map<string, number>()
      let count = 0
      for (const r of batchResults) {
        if (!r.svgElement) continue
        const val = r.value ?? 'barcode'
        const n = nameCount.get(val) ?? 0
        nameCount.set(val, n + 1)
        const filename = n === 0 ? `${val}.svg` : `${val}_${n}.svg`
        zip.file(filename, serializeSvg(r.svgElement))
        count++
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, 'codigos-de-barras.zip')
      trackDownload('barcode_generator', format, 'zip')
      showToast(`Download iniciado — ZIP com ${count} códigos`, 'success')
      setShowShare(true)
    } catch {
      setError('Erro ao gerar ZIP. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }, [batchResults, format])

  const downloadPdf = useCallback(async () => {
    setIsExporting(true)
    try {
      const svgs = tab === 'batch'
        ? batchResults.map(r => r.svgElement).filter((el): el is SVGSVGElement => !!el)
        : svgRef.current ? [svgRef.current] : []

      if (svgs.length === 0) {
        setError('Gere um código antes de exportar em PDF.')
        return
      }

      await exportSvgsToPdf(svgs, 'codigos-de-barras.pdf', bgColor)
      trackDownload('barcode_generator', format, 'pdf')
      showToast('Download iniciado — PDF', 'success')
      setShowShare(true)
    } catch {
      setError('Erro ao gerar PDF. Tente baixar em outro formato.')
    } finally {
      setIsExporting(false)
    }
  }, [tab, batchResults, bgColor, format])

  const printLabels = useCallback((cols: number, rows: number) => {
    const svgs: Iterable<SVGSVGElement> = tab === 'batch'
      ? batchResults.map(r => r.svgElement).filter((el): el is SVGSVGElement => !!el)
      : svgRef.current ? [svgRef.current] : []

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setError('O navegador bloqueou a janela de impressão. Permita pop-ups para este site e tente novamente.')
      return
    }

    const svgHtmls = Array.from(svgs).map(svg => serializeSvg(svg))

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
  }, [tab, batchResults])

  const downloadSvgSingle = () => {
    if (svgRef.current) {
      void downloadSvg(svgRef.current, 'svg', { filename: 'codigo-de-barras' })
      trackDownload('barcode_generator', format, 'svg')
      showToast('Download iniciado — SVG', 'success')
      setShowShare(true)
    }
  }
  const downloadPng = async () => {
    if (!svgRef.current) return
    setIsExporting(true)
    try {
      await downloadSvg(svgRef.current, 'png', { filename: 'codigo-de-barras', bgColor, scale: 2 })
      trackDownload('barcode_generator', format, 'png')
      showToast('Download iniciado — PNG', 'success')
      setShowShare(true)
    } catch {
      setError('Erro ao gerar PNG. Tente baixar em SVG.')
    } finally {
      setIsExporting(false)
    }
  }

  const copyValue = useCallback(async () => {
    // Usa o service para resolver o valor (check digit, etc.)
    const result = serviceRef.current?.validate(input, format as Parameters<NonNullable<typeof serviceRef.current>['validate']>[1])
    const val = result?.valid ? result.resolved : input.trim()
    if (!val) return
    try {
      await navigator.clipboard.writeText(val)
      showToast('Copiado para a área de transferência', 'success')
    } catch {
      showToast('Não foi possível copiar', 'error')
    }
  }, [input, format])

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
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
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
                aria-describedby={currentFormat ? 'barcode-format-hint' : undefined}
                className={inputNormal}
              >
                {FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {currentFormat && (
                <p id="barcode-format-hint" className="text-xs text-gray-400 mt-1">{currentFormat.hint}</p>
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

          <details open className="group">
            <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900 list-none flex items-center gap-1 select-none">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              Personalizar aparência
            </summary>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            <label className="flex items-center gap-2 cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={showText}
                onChange={e => setShowText(e.target.checked)}
                className="accent-indigo-600 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Mostrar texto abaixo do código</span>
            </label>
          </details>
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
              aria-describedby={checkDigitHint ? 'barcode-check-digit-hint' : undefined}
              className={inputNormal}
            />
            {checkDigitHint && (
              <p id="barcode-check-digit-hint" className="text-green-600 text-xs mt-1">{checkDigitHint}</p>
            )}
            {error && <p className="text-red-600 text-xs mt-1" role="alert">{error}</p>}
          </div>

          <button
            onClick={generate}
            disabled={!barcodeReady}
            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {barcodeReady ? 'Gerar Código de Barras' : 'Carregando gerador…'}
          </button>
          <PrivacyChip />

          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex flex-col items-center gap-4 min-h-[160px] justify-center">
            <svg ref={svgRef} className={generated ? 'animate-fade-in' : 'hidden'} aria-label={`Código de barras ${format} gerado`} role="img" />
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
                  className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  PNG
                </button>
                <button
                  onClick={downloadSvgSingle}
                  disabled={isExporting}
                  aria-label="Baixar SVG"
                  className="bg-white border border-indigo-600 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  SVG
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={isExporting}
                  aria-label="Baixar PDF"
                  className="bg-white border border-indigo-600 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  {isExporting ? 'Gerando…' : 'PDF'}
                </button>
                <button
                  onClick={() => printLabels(3, 5)}
                  disabled={isExporting}
                  aria-label="Imprimir etiquetas"
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                >
                  Imprimir
                </button>
              </div>
              <ShareBlock visible={showShare} toolSlug={SHARE.toolSlug} whatsappText={SHARE.whatsappText} shareUrl={SHARE.shareUrl} />
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

          {error && <p className="text-red-600 text-xs" role="alert">{error}</p>}

          <button
            onClick={generateBatch}
            disabled={!barcodeReady}
            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {barcodeReady ? 'Gerar Todos' : 'Carregando gerador…'}
          </button>

          {batchResults.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {batchResults.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex flex-col items-center gap-2">
                    {r.error ? (
                      <p className="text-red-500 text-xs">{r.error}</p>
                    ) : (
                      <div
                        ref={el => { if (el && r.svgElement) el.replaceChildren(r.svgElement) }}
                        aria-label={`Código ${r.value}`}
                        role="img"
                      />
                    )}
                    <span className="text-xs text-gray-500 font-mono">{r.value}</span>
                  </div>
                ))}
              </div>

              {batchResults.some(r => r.svgElement) && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button onClick={downloadBatchZip} disabled={isExporting} aria-label="Baixar lote em ZIP (SVG)" className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                      {isExporting ? 'Gerando…' : 'ZIP (SVG)'}
                    </button>
                    <button onClick={downloadPdf} disabled={isExporting} aria-label="Baixar lote em PDF" className="bg-white border border-indigo-600 text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                      {isExporting ? 'Gerando…' : 'PDF'}
                    </button>
                    <button onClick={() => printLabels(3, 5)} disabled={isExporting} aria-label="Imprimir etiquetas 3 colunas por 5 linhas" className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
                      Etiquetas 3x5
                    </button>
                    <button onClick={() => printLabels(2, 5)} disabled={isExporting} aria-label="Imprimir etiquetas 2 colunas por 5 linhas" className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2">
                      Etiquetas 2x5
                    </button>
                  </div>
                  <ShareBlock visible={showShare} toolSlug={SHARE.toolSlug} whatsappText={SHARE.whatsappText} shareUrl={SHARE.shareUrl} />
                </>
              )}
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
                <h2 className="text-sm font-semibold text-gray-700">Últimos códigos gerados</h2>
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

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {generated ? `Código de barras ${format} gerado com sucesso` : ''}
      </div>

      {tab === 'single' && generated && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 safe-area-inset-bottom">
          <button
            onClick={copyValue}
            className="flex-1 bg-white border border-indigo-600 text-indigo-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors min-h-[44px]"
          >
            Copiar valor
          </button>
          <button
            onClick={downloadPng}
            disabled={isExporting}
            className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            Baixar PNG
          </button>
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
