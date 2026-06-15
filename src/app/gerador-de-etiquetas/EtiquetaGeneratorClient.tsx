'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { trackGenerate, trackDownload } from '@/lib/analytics'
import { downloadDataUrl } from '@/lib/download'
import { showToast } from '@/components/Toast'
import PrivacyChip from '@/components/ui/PrivacyChip'
import ShareBlock from '@/components/ShareBlock'
import { getShareConfig } from '@/lib/share-config'
import { incrementCount } from '@/lib/counter'

const SHARE = getShareConfig('gerador-de-etiquetas')

type TipoCodigo = 'ean13' | 'qrcode' | 'nenhum'
type Tamanho = '50x30' | '70x40' | '100x50' | '100x70'

const TAMANHOS: Record<Tamanho, { w: number; h: number; label: string }> = {
  '50x30':  { w: 50,  h: 30,  label: '50×30mm — Pequenos produtos' },
  '70x40':  { w: 70,  h: 40,  label: '70×40mm — Roupas e calçados' },
  '100x50': { w: 100, h: 50,  label: '100×50mm — Produtos maiores' },
  '100x70': { w: 100, h: 70,  label: '100×70mm — Etiqueta completa' },
}

const PX_PER_MM = 8

function formatPreco(raw: string): string {
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace('.', ',')
  return cleaned ? `R$ ${cleaned}` : ''
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, baseFontSize: number): number {
  let size = baseFontSize
  ctx.font = `bold ${size}px sans-serif`
  while (ctx.measureText(text).width > maxWidth && size > 8) {
    size -= 1
    ctx.font = `bold ${size}px sans-serif`
  }
  return size
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors'

export default function EtiquetaGeneratorClient() {
  const [nomeProduto, setNomeProduto] = useState('')
  const [preco, setPreco] = useState('')
  const [tipoCodigo, setTipoCodigo] = useState<TipoCodigo>('ean13')
  const [codigo, setCodigo] = useState('')
  const [tamanho, setTamanho] = useState<Tamanho>('50x30')
  const [renderError, setRenderError] = useState('')
  const [hasContent, setHasContent] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Hidden canvas used as JsBarcode render target — avoids SVG taint issues
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const drawLabel = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dims = TAMANHOS[tamanho]
    const W = dims.w * PX_PER_MM
    const H = dims.h * PX_PER_MM
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, W - 2, H - 2)

    const MARGIN = Math.max(8, Math.round(W * 0.04))
    let y = MARGIN
    const contentW = W - MARGIN * 2
    let drewSomething = false

    const nome = nomeProduto.trim()
    const precoFmt = formatPreco(preco.trim())

    if (nome) {
      const maxFontSize = Math.min(22, Math.round(H * 0.18))
      const fontSize = fitText(ctx, nome.toUpperCase(), contentW, maxFontSize)
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillStyle = '#111827'
      ctx.textAlign = 'center'
      ctx.fillText(nome.toUpperCase(), W / 2, y + fontSize)
      y += fontSize + Math.round(fontSize * 0.4)
      drewSomething = true
    }

    if (precoFmt) {
      const maxFontSize = Math.min(28, Math.round(H * 0.22))
      const fontSize = fitText(ctx, precoFmt, contentW, maxFontSize)
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillStyle = '#059669'
      ctx.textAlign = 'center'
      ctx.fillText(precoFmt, W / 2, y + fontSize)
      y += fontSize + Math.round(fontSize * 0.35)
      drewSomething = true
    }

    const hasCodigo = tipoCodigo !== 'nenhum' && codigo.trim()

    if (hasCodigo) {
      const availH = H - y - MARGIN
      const availW = contentW

      if (tipoCodigo === 'ean13') {
        const bc = barcodeCanvasRef.current
        if (!bc) return
        try {
          const JsBarcode = (await import('jsbarcode')).default
          const barH = Math.max(20, Math.round(availH * 0.72))
          JsBarcode(bc, codigo.trim(), {
            format: 'EAN13',
            displayValue: true,
            fontSize: Math.max(8, Math.round(availH * 0.14)),
            margin: 2,
            background: '#ffffff',
            lineColor: '#000000',
            width: Math.max(1, Math.round(availW / 100)),
            height: barH,
          })
          const scale = Math.min(availW / bc.width, availH / bc.height)
          const drawW = bc.width * scale
          const drawH = bc.height * scale
          ctx.drawImage(bc, (W - drawW) / 2, y + (availH - drawH) / 2, drawW, drawH)
          drewSomething = true
          setRenderError('')
        } catch {
          setRenderError('Código EAN-13 inválido. Verifique se tem 12 ou 13 dígitos.')
          ctx.fillStyle = '#ef4444'
          ctx.font = `${Math.max(10, Math.round(H * 0.07))}px sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText('Código inválido', W / 2, y + availH / 2)
        }
      } else if (tipoCodigo === 'qrcode') {
        try {
          const qrSize = Math.min(availW, availH)
          const qrCanvas = document.createElement('canvas')
          await QRCode.toCanvas(qrCanvas, codigo.trim(), {
            width: qrSize,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
          })
          ctx.drawImage(qrCanvas, (W - qrSize) / 2, y + (availH - qrSize) / 2, qrSize, qrSize)
          drewSomething = true
          setRenderError('')
        } catch {
          setRenderError('Erro ao gerar QR Code. Verifique a URL ou texto.')
        }
      }
    } else if (tipoCodigo !== 'nenhum') {
      setRenderError('')
    }

    if (!nome && !precoFmt && !hasCodigo) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = `${Math.max(10, Math.round(H * 0.09))}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('Preencha os campos ao lado', W / 2, H / 2)
      setHasContent(false)
    } else {
      setHasContent(drewSomething)
    }
  }, [nomeProduto, preco, tipoCodigo, codigo, tamanho])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(drawLabel, 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [drawLabel])

  const getCanvasDataUrl = () => canvasRef.current?.toDataURL('image/png') ?? ''

  const handleDownloadPng = () => {
    const dataUrl = getCanvasDataUrl()
    if (!dataUrl) return
    downloadDataUrl(dataUrl, 'etiqueta.png')
    trackDownload('etiqueta_generator', 'etiqueta', 'png')
    trackGenerate('etiqueta_generator', 'etiqueta')
    incrementCount()
    showToast('Download iniciado — PNG', 'success')
    setShowShare(true)
  }

  const handleDownloadPdf = async () => {
    const dataUrl = getCanvasDataUrl()
    if (!dataUrl) return
    setExporting(true)
    try {
      const jsPDF = (await import('jspdf')).jsPDF
      const dims = TAMANHOS[tamanho]
      const W_MM = dims.w
      const H_MM = dims.h
      const PAGE_W = 210
      const PAGE_H = 297
      const GAP = 3
      const cols = Math.max(1, Math.floor(PAGE_W / (W_MM + GAP)))
      const rows = Math.max(1, Math.floor(PAGE_H / (H_MM + GAP)))
      const total = cols * rows
      const startX = (PAGE_W - cols * W_MM - (cols - 1) * GAP) / 2
      const startY = (PAGE_H - rows * H_MM - (rows - 1) * GAP) / 2
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      for (let i = 0; i < total; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        doc.addImage(dataUrl, 'PNG', startX + col * (W_MM + GAP), startY + row * (H_MM + GAP), W_MM, H_MM)
      }
      doc.save('etiquetas.pdf')
      trackDownload('etiqueta_generator', 'etiqueta', 'pdf')
      showToast(`Download iniciado — PDF (${total} cópias por folha)`, 'success')
      setShowShare(true)
    } catch {
      showToast('Erro ao gerar PDF. Tente baixar em PNG.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const dims = TAMANHOS[tamanho]
  const previewScale = Math.min(1, 360 / (dims.w * PX_PER_MM))

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label htmlFor="etiqueta-nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do produto <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            id="etiqueta-nome"
            type="text"
            value={nomeProduto}
            onChange={e => setNomeProduto(e.target.value)}
            placeholder="Ex: Vela Aromática Lavanda"
            maxLength={50}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="etiqueta-preco" className="block text-sm font-medium text-gray-700 mb-1">
            Preço <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            id="etiqueta-preco"
            type="text"
            value={preco}
            onChange={e => setPreco(e.target.value)}
            placeholder="Ex: 29,90"
            maxLength={12}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="etiqueta-tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de código
          </label>
          <select
            id="etiqueta-tipo"
            value={tipoCodigo}
            onChange={e => { setTipoCodigo(e.target.value as TipoCodigo); setCodigo(''); setRenderError('') }}
            className={inputCls}
          >
            <option value="ean13">Código de barras EAN-13</option>
            <option value="qrcode">QR Code</option>
            <option value="nenhum">Sem código</option>
          </select>
        </div>

        {tipoCodigo !== 'nenhum' && (
          <div>
            <label htmlFor="etiqueta-codigo" className="block text-sm font-medium text-gray-700 mb-1">
              {tipoCodigo === 'ean13' ? 'Código EAN-13 (12 ou 13 dígitos)' : 'URL ou texto para o QR Code'}
            </label>
            <input
              id="etiqueta-codigo"
              type="text"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              placeholder={tipoCodigo === 'ean13' ? 'Ex: 789012345678' : 'Ex: https://seusite.com.br'}
              maxLength={tipoCodigo === 'ean13' ? 13 : 500}
              className={inputCls}
            />
            {tipoCodigo === 'ean13' && (
              <p className="text-xs text-gray-400 mt-1">
                Sem EAN?{' '}
                <a href="/gerador-de-ean" className="text-emerald-600 hover:underline">
                  Gere um gratuitamente
                </a>
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="etiqueta-tamanho" className="block text-sm font-medium text-gray-700 mb-1">
            Tamanho da etiqueta
          </label>
          <select
            id="etiqueta-tamanho"
            value={tamanho}
            onChange={e => setTamanho(e.target.value as Tamanho)}
            className={inputCls}
          >
            {Object.entries(TAMANHOS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {renderError && (
          <p className="text-red-600 text-xs flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {renderError}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleDownloadPng}
            disabled={!hasContent}
            className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-700 active:bg-emerald-800 transition-colors min-h-[44px] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            PNG
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={!hasContent || exporting}
            className="flex-1 bg-white border border-emerald-600 text-emerald-700 px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-50 active:bg-emerald-100 transition-colors min-h-[44px] disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            {exporting ? 'Gerando PDF…' : 'PDF (múltiplas cópias)'}
          </button>
        </div>
        <PrivacyChip />
      </div>

      {/* Preview */}
      <div className="flex-1">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Preview da etiqueta</h2>
            <span className="text-xs text-gray-400">{dims.w}×{dims.h}mm</span>
          </div>
          <div
            className="flex items-start justify-center bg-gray-50 rounded-lg p-4 min-h-[200px]"
            aria-label="Preview da etiqueta gerada"
          >
            <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center' }}>
              <canvas
                ref={canvasRef}
                style={{ display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}
                aria-label="Etiqueta gerada"
              />
            </div>
          </div>
          {hasContent && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              Preview em escala reduzida. O download é em resolução total.
            </p>
          )}
          <ShareBlock
            visible={showShare}
            toolSlug={SHARE.toolSlug}
            whatsappText={SHARE.whatsappText}
            shareUrl={SHARE.shareUrl}
          />
        </div>

        {/* Hidden canvas for JsBarcode — canvas-to-canvas avoids SVG taint */}
        <canvas ref={barcodeCanvasRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} />
      </div>
    </div>
  )
}
