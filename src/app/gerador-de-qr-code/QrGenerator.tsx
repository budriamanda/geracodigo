'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { trackGenerate, trackDownload } from '@/lib/analytics'
import { downloadDataUrl, downloadBlob } from '@/lib/download'

const SIZES = [200, 300, 400, 500]

export default function QrGenerator() {
  const [input, setInput] = useState('')
  const [size, setSize] = useState(300)
  const [darkColor, setDarkColor] = useState('#000000')
  const [lightColor, setLightColor] = useState('#ffffff')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasTrackedRef = useRef(false)

  const generate = useCallback(async () => {
    if (!input.trim()) { setQrDataUrl(''); setError(''); hasTrackedRef.current = false; return }
    try {
      const url = await QRCode.toDataURL(input.trim(), {
        width: size,
        margin: 2,
        color: { dark: darkColor, light: lightColor },
      })
      setQrDataUrl(url)
      setError('')
      if (!hasTrackedRef.current) {
        trackGenerate('qr_code_generator', 'qr_code')
        hasTrackedRef.current = true
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

  const downloadPng = () => {
    if (!qrDataUrl) return
    downloadDataUrl(qrDataUrl, 'qrcode.png')
    trackDownload('qr_code_generator', 'qr_code', 'png')
  }

  const downloadSvg = async () => {
    if (!input.trim()) return
    try {
      const svgStr = await QRCode.toString(input.trim(), { type: 'svg', width: size, margin: 2, color: { dark: darkColor, light: lightColor } })
      downloadBlob(new Blob([svgStr], { type: 'image/svg+xml' }), 'qrcode.svg')
      trackDownload('qr_code_generator', 'qr_code', 'svg')
    } catch {
      setError('Erro ao gerar SVG. Tente baixar em PNG.')
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
        {error && <p className="text-red-500 text-xs" role="alert">{error}</p>}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900 self-start">Preview</h2>
        {qrDataUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada dinamicamente, next/image nao aplica */}
            <img src={qrDataUrl} alt="Preview do QR Code gerado" width={200} height={200} className="rounded-lg max-w-[200px]" />
            <div className="flex gap-2 w-full">
              <button onClick={downloadPng} aria-label="Baixar QR Code em formato PNG" className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Download PNG</button>
              <button onClick={downloadSvg} aria-label="Baixar QR Code em formato SVG" className="flex-1 bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">Download SVG</button>
            </div>
          </>
        ) : (
          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center px-4">
            Digite algo para gerar o QR Code
          </div>
        )}
      </div>
    </div>
  )
}
