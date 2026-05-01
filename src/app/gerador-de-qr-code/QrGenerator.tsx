'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { trackGenerate, trackDownload } from '@/lib/analytics'
import { incrementCount } from '@/lib/counter'
import { downloadDataUrl, downloadBlob } from '@/lib/download'
import { showToast } from '@/components/Toast'
import ExportActions from '@/components/ExportActions'
import PreviewArea from '@/components/ui/PreviewArea'
import PrivacyChip from '@/components/ui/PrivacyChip'

type ExportState = 'idle' | 'pdf'

const SIZES = [200, 300, 400, 500]

const MIN_CONTRAST_RATIO = 3

function hexToLinear(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return [0, 0, 0]
  return [m[1], m[2], m[3]].map(h => {
    const c = parseInt(h, 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }) as [number, number, number]
}

function contrastRatio(a: string, b: string): number {
  const [r1, g1, b1] = hexToLinear(a)
  const [r2, g2, b2] = hexToLinear(b)
  const l1 = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1
  const l2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export default function QrGenerator() {
  const [input, setInput] = useState('')
  const [size, setSize] = useState(300)
  const [darkColor, setDarkColor] = useState('#000000')
  const [lightColor, setLightColor] = useState('#ffffff')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState<ExportState>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasTrackedRef = useRef(false)

  const lowContrast = contrastRatio(darkColor, lightColor) < MIN_CONTRAST_RATIO

  const prevInputRef = useRef('')

  const generate = useCallback(async () => {
    if (!input.trim()) { setQrDataUrl(''); setError(''); hasTrackedRef.current = false; prevInputRef.current = ''; return }
    try {
      const trimmed = input.trim()
      const url = await QRCode.toDataURL(trimmed, {
        width: size,
        margin: 2,
        color: { dark: darkColor, light: lightColor },
      })
      setQrDataUrl(url)
      setError('')
      if (!hasTrackedRef.current || trimmed !== prevInputRef.current) {
        trackGenerate('qr_code_generator', 'qr_code')
        incrementCount()
        hasTrackedRef.current = true
        prevInputRef.current = trimmed
      }
    } catch {
      setError('Erro ao gerar QR Code.')
    }
  }, [input, size, darkColor, lightColor])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(generate, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [generate])

  const handleGenerateClick = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    generate()
  }

  const downloadPng = () => {
    if (!qrDataUrl) return
    downloadDataUrl(qrDataUrl, 'qrcode.png')
    trackDownload('qr_code_generator', 'qr_code', 'png')
    showToast('Download iniciado — PNG', 'success')
  }

  const downloadSvg = async () => {
    if (!input.trim()) return
    try {
      const svgStr = await QRCode.toString(input.trim(), { type: 'svg', width: size, margin: 2, color: { dark: darkColor, light: lightColor } })
      downloadBlob(new Blob([svgStr], { type: 'image/svg+xml' }), 'qrcode.svg')
      trackDownload('qr_code_generator', 'qr_code', 'svg')
      showToast('Download iniciado — SVG', 'success')
    } catch {
      setError('Erro ao gerar SVG. Tente baixar em PNG.')
    }
  }

  const downloadPdf = async () => {
    if (!qrDataUrl) return
    setExporting('pdf')
    try {
      const jsPDF = (await import('jspdf')).jsPDF
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgSize = 80
      const x = (210 - imgSize) / 2
      const y = 30
      doc.addImage(qrDataUrl, 'PNG', x, y, imgSize, imgSize)
      doc.save('qrcode.pdf')
      trackDownload('qr_code_generator', 'qr_code', 'pdf')
      showToast('Download iniciado — PDF', 'success')
    } catch {
      setError('Erro ao gerar PDF. Tente baixar em PNG.')
    } finally {
      setExporting('idle')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label htmlFor="qr-content" className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
          <textarea
            id="qr-content"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="https://seusite.com.br ou qualquer texto..."
            aria-required="true"
            maxLength={4296}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
          />
        </div>
        <div>
          <label htmlFor="qr-size" className="block text-sm font-medium text-gray-700 mb-1">Tamanho</label>
          <select
            id="qr-size"
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SIZES.map(s => <option key={s} value={s}>{s}×{s}px</option>)}
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="dark-color" className="block text-sm font-medium text-gray-700 mb-1">Cor escura</label>
            <div className="flex gap-2 items-center">
              <input id="dark-color" type="color" value={darkColor} onChange={e => setDarkColor(e.target.value)} aria-describedby="dark-color-hex" className="h-8 w-10 rounded border border-gray-300 cursor-pointer" />
              <span id="dark-color-hex" className="text-xs text-gray-500 font-mono">{darkColor}</span>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="light-color" className="block text-sm font-medium text-gray-700 mb-1">Cor de fundo</label>
            <div className="flex gap-2 items-center">
              <input id="light-color" type="color" value={lightColor} onChange={e => setLightColor(e.target.value)} aria-describedby="light-color-hex" className="h-8 w-10 rounded border border-gray-300 cursor-pointer" />
              <span id="light-color-hex" className="text-xs text-gray-500 font-mono">{lightColor}</span>
            </div>
          </div>
        </div>
        {lowContrast && (
          <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs" role="status">
            ⚠ Contraste baixo entre as cores escolhidas. Alguns leitores podem não conseguir escanear o QR Code.
          </p>
        )}
        {error && <p className="text-red-600 text-xs" role="alert">{error}</p>}

        <button
          onClick={handleGenerateClick}
          className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Gerar QR Code
        </button>
        <PrivacyChip />
      </div>

      <PreviewArea
        title="Preview do QR Code"
        hasContent={!!qrDataUrl}
        emptyText="Digite algo para gerar o QR Code"
        ariaLiveText={qrDataUrl ? 'QR Code gerado com sucesso' : ''}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada dinamicamente, next/image nao aplica */}
        <img src={qrDataUrl!} alt="Preview do QR Code gerado" width={size} height={size} className="rounded-lg max-w-full animate-fade-in" style={{ maxWidth: `${Math.min(size, 300)}px` }} />
        <div className="w-full">
          <ExportActions
            disabled={exporting !== 'idle'}
            actions={[
              { label: 'PNG', ariaLabel: 'Baixar QR Code em formato PNG', onClick: downloadPng, variant: 'primary' },
              { label: 'SVG', ariaLabel: 'Baixar QR Code em formato SVG', onClick: downloadSvg, variant: 'secondary' },
              { label: 'PDF', ariaLabel: 'Baixar QR Code em formato PDF', onClick: downloadPdf, variant: 'secondary', loading: exporting === 'pdf', loadingLabel: 'Gerando…' },
            ]}
          />
        </div>
      </PreviewArea>
    </div>
  )
}
