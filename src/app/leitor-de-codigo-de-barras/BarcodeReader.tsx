'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { trackScan, trackCopy } from '@/lib/analytics'
import { showToast } from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'

interface DecodedResult {
  value: string
  format: string
  timestamp: number
}

const SCAN_INTERVAL_MS = 150

export default function BarcodeReader() {
  const [isScanning, setIsScanning] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [results, setResults] = useState<DecodedResult[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetector | null>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  useEffect(() => () => {
    stopCamera()
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    setError('')
    setCopyError('')
    if (typeof BarcodeDetector === 'undefined') {
      const browser = navigator.userAgent
      const isSafari = /Safari/.test(browser) && !/Chrome/.test(browser)
      const isFirefox = /Firefox/.test(browser)
      const browserName = isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'seu navegador'
      setError(
        `O ${browserName} ainda não suporta a leitura automática via câmera (API BarcodeDetector). ` +
        'Use o Chrome 83+, Edge 83+ ou Opera 69+ para escanear pela câmera. ' +
        'Você também pode digitar o código manualmente no campo abaixo.'
      )
      return
    }

    setIsCameraLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      detectorRef.current = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'code_93', 'upc_a', 'upc_e', 'itf', 'codabar', 'qr_code'],
      })
      setIsScanning(true)
    } catch {
      stopCamera()
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.')
    } finally {
      setIsCameraLoading(false)
    }
  }, [stopCamera])

  useEffect(() => {
    if (!isScanning) return

    let timerId: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    async function scanFrame() {
      if (cancelled) return
      if (!videoRef.current || !detectorRef.current || !canvasRef.current) {
        timerId = setTimeout(scanFrame, SCAN_INTERVAL_MS)
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        timerId = setTimeout(scanFrame, SCAN_INTERVAL_MS)
        return
      }

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      try {
        const barcodes = await detectorRef.current.detect(canvas)
        for (const bc of barcodes) {
          setResults(prev => {
            if (prev.some(r => r.value === bc.rawValue)) return prev
            queueMicrotask(() => {
              trackScan(bc.format)
              try { navigator.vibrate?.(100) } catch { /* vibration not supported */ }
            })
            return [{ value: bc.rawValue, format: bc.format, timestamp: Date.now() }, ...prev].slice(0, 50)
          })
        }
      } catch { /* skip frame errors */ }

      if (!cancelled) {
        timerId = setTimeout(scanFrame, SCAN_INTERVAL_MS)
      }
    }

    scanFrame()
    return () => {
      cancelled = true
      if (timerId) clearTimeout(timerId)
    }
  }, [isScanning])

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      setCopyError('')
      trackCopy('barcode_reader', 'scanned_code')
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000)
    } catch {
      showToast('Não foi possível copiar. Selecione o texto manualmente.', 'error')
    }
  }

  const handleManualAdd = () => {
    const val = manualInput.trim()
    if (!val) return
    setResults(prev => {
      if (prev.some(r => r.value === val)) return prev
      return [{ value: val, format: 'manual', timestamp: Date.now() }, ...prev]
    })
    setManualInput('')
    trackScan('manual')
  }

  const formatLabel = (fmt: string) => {
    const labels: Record<string, string> = {
      ean_13: 'EAN-13', ean_8: 'EAN-8', code_128: 'Code 128', code_39: 'Code 39',
      code_93: 'Code 93', upc_a: 'UPC-A', upc_e: 'UPC-E', itf: 'ITF',
      codabar: 'Codabar', qr_code: 'QR Code', manual: 'Manual',
    }
    return labels[fmt] ?? fmt
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Camera area */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 min-h-[300px]">
          <video
            ref={videoRef}
            className={`w-full ${isScanning ? '' : 'hidden'}`}
            playsInline
            muted
            aria-label="Feed da câmera para leitura de código de barras"
          />
          <canvas ref={canvasRef} className="hidden" />
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
              {isCameraLoading ? (
                <>
                  <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-gray-300">Acessando câmera…</p>
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <p className="text-sm text-gray-300 text-center max-w-xs">
                    Aponte a câmera para um código de barras ou QR Code para leitura automática
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isScanning ? (
            <button
              onClick={startCamera}
              disabled={isCameraLoading}
              className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {isCameraLoading ? 'Acessando…' : 'Iniciar Câmera'}
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Parar Câmera
            </button>
          )}
        </div>

        {/* Manual input fallback */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label htmlFor="manual-barcode" className="block text-sm font-medium text-gray-700 mb-1">
            Ou digite o código manualmente
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="manual-barcode"
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleManualAdd() }}
              placeholder="Digite ou cole o código..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
            <button
              type="button"
              onClick={handleManualAdd}
              className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {results.length > 0
          ? `${results.length} código${results.length > 1 ? 's' : ''} detectado${results.length > 1 ? 's' : ''}. Último: ${results[0].value}`
          : ''}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Códigos detectados ({results.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-red-500 hover:text-red-700 min-h-[44px] px-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Limpar
            </button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {results.map((r, i) => (
              <div key={`${r.value}-${i}`} className="flex items-start gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono shrink-0">
                      {formatLabel(r.format)}
                    </span>
                    <time className="text-xs text-gray-400 shrink-0" dateTime={new Date(r.timestamp).toISOString()}>
                      {new Date(r.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </time>
                  </div>
                  <span className="text-sm text-gray-800 font-mono truncate">{r.value}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(r.value)}
                  className={`text-xs px-3 py-2 rounded transition-colors shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                    copied === r.value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copied === r.value ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={showClearConfirm}
        title="Limpar códigos"
        message="Tem certeza que deseja limpar todos os códigos detectados?"
        confirmLabel="Limpar"
        cancelLabel="Cancelar"
        onConfirm={() => { setResults([]); setShowClearConfirm(false) }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
