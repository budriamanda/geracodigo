'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { trackScan, trackCopy, trackToolAttempt } from '@/lib/analytics'
import { showToast } from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'
import ShareBlock from '@/components/ShareBlock'
import { getShareConfig } from '@/lib/share-config'

const SHARE = getShareConfig('leitor-de-qr-code')

type ContentType = 'url' | 'pix' | 'wifi' | 'text'

interface ParsedPix {
  name?: string
  city?: string
  amount?: string
}

interface ParsedWifi {
  ssid: string
  password: string
  security: string
}

interface DecodedResult {
  value: string
  timestamp: number
  contentType: ContentType
  parsedPix?: ParsedPix
  parsedWifi?: ParsedWifi
}

const SCAN_INTERVAL_MS = 150

// Simple EMV TLV field extractor for Pix payloads
function parseEmvField(payload: string, fieldId: string): string {
  let i = 0
  while (i + 4 <= payload.length) {
    const id = payload.slice(i, i + 2)
    const len = parseInt(payload.slice(i + 2, i + 4), 10)
    if (isNaN(len) || i + 4 + len > payload.length) break
    if (id === fieldId) return payload.slice(i + 4, i + 4 + len)
    i += 4 + len
  }
  return ''
}

function analyzeContent(value: string): Pick<DecodedResult, 'contentType' | 'parsedPix' | 'parsedWifi'> {
  if (/^https?:\/\//i.test(value)) {
    return { contentType: 'url' }
  }
  if (value.startsWith('WIFI:')) {
    const ssid = value.match(/S:([^;]+)/)?.[1] ?? ''
    const password = value.match(/P:([^;]+)/)?.[1] ?? ''
    const security = value.match(/T:([^;]+)/)?.[1] ?? ''
    return { contentType: 'wifi', parsedWifi: { ssid, password, security } }
  }
  // Pix BR Code EMV: starts with 000201
  if (value.startsWith('000201')) {
    const name = parseEmvField(value, '59')
    const city = parseEmvField(value, '60')
    const amount = parseEmvField(value, '54')
    return {
      contentType: 'pix',
      parsedPix: {
        name: name || undefined,
        city: city || undefined,
        amount: amount || undefined,
      },
    }
  }
  return { contentType: 'text' }
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  url: 'Link / URL',
  pix: 'QR Pix',
  wifi: 'Wi-Fi',
  text: 'Texto',
}

const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  url: 'bg-blue-100 text-blue-700',
  pix: 'bg-green-100 text-green-700',
  wifi: 'bg-purple-100 text-purple-700',
  text: 'bg-gray-100 text-gray-700',
}

interface ResultCardProps {
  result: DecodedResult
  index: number
  copied: string | null
  wifiRevealed: boolean
  onCopy: (value: string, key: string) => void
  onToggleWifi: () => void
}

function ResultCard({ result, index, copied, wifiRevealed, onCopy, onToggleWifi }: ResultCardProps) {
  const { value, timestamp, contentType, parsedPix, parsedWifi } = result
  const copyKey = `${index}-${value}`
  const isCopied = copied === copyKey

  const btnBase =
    'text-sm px-3 py-2 rounded-lg transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
  const btnDefault = 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
  const btnCopied = 'bg-green-100 text-green-700'

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${CONTENT_TYPE_COLORS[contentType]}`}>
          {CONTENT_TYPE_LABELS[contentType]}
        </span>
        <time className="text-xs text-gray-400" dateTime={new Date(timestamp).toISOString()}>
          {new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </time>
      </div>

      {contentType === 'url' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-800 font-mono break-all">{value}</p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-sky-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-sky-700 transition-colors min-h-[44px] inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              Abrir link
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            <button
              type="button"
              onClick={() => onCopy(value, copyKey)}
              className={`${btnBase} ${isCopied ? btnCopied : btnDefault}`}
            >
              {isCopied ? 'Copiado!' : 'Copiar URL'}
            </button>
          </div>
        </div>
      )}

      {contentType === 'pix' && (
        <div className="space-y-2">
          {parsedPix?.name && (
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Recebedor</span>
              <span className="font-medium text-gray-800 text-right">{parsedPix.name}</span>
            </div>
          )}
          {parsedPix?.city && (
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Cidade</span>
              <span className="font-medium text-gray-800">{parsedPix.city}</span>
            </div>
          )}
          {parsedPix?.amount && (
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Valor</span>
              <span className="font-medium text-gray-800">R$ {parsedPix.amount}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onCopy(value, copyKey)}
            className={`${btnBase} ${isCopied ? btnCopied : btnDefault}`}
          >
            {isCopied ? 'Copiado!' : 'Copiar payload Pix'}
          </button>
        </div>
      )}

      {contentType === 'wifi' && parsedWifi && (
        <div className="space-y-2">
          {parsedWifi.ssid && (
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Rede (SSID)</span>
              <span className="font-medium text-gray-800">{parsedWifi.ssid}</span>
            </div>
          )}
          {parsedWifi.security && (
            <div className="flex justify-between text-sm gap-4">
              <span className="text-gray-500 shrink-0">Segurança</span>
              <span className="font-medium text-gray-800">{parsedWifi.security}</span>
            </div>
          )}
          {parsedWifi.password && (
            <div className="flex justify-between items-center text-sm gap-4">
              <span className="text-gray-500 shrink-0">Senha</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-gray-800">
                  {wifiRevealed ? parsedWifi.password : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={onToggleWifi}
                  aria-pressed={wifiRevealed}
                  aria-label={wifiRevealed ? 'Ocultar senha Wi-Fi' : 'Revelar senha Wi-Fi'}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  {wifiRevealed ? 'Ocultar' : 'Revelar'}
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2 flex-wrap pt-1">
            {parsedWifi.password && (
              <button
                type="button"
                onClick={() => onCopy(parsedWifi.password, copyKey)}
                className={`${btnBase} ${isCopied ? btnCopied : btnDefault}`}
              >
                {isCopied ? 'Copiado!' : 'Copiar senha'}
              </button>
            )}
          </div>
        </div>
      )}

      {contentType === 'text' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-800 font-mono break-all whitespace-pre-wrap">{value}</p>
          <button
            type="button"
            onClick={() => onCopy(value, copyKey)}
            className={`${btnBase} ${isCopied ? btnCopied : btnDefault}`}
          >
            {isCopied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function QrCodeReader() {
  const [isScanning, setIsScanning] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [results, setResults] = useState<DecodedResult[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [revealedWifi, setRevealedWifi] = useState<Set<number>>(new Set())
  const [browserWarning, setBrowserWarning] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetector | null>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof BarcodeDetector === 'undefined') {
      const ua = navigator.userAgent
      const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
      const isFirefox = /Firefox/.test(ua)
      const browserName = isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'seu navegador'
      setBrowserWarning(
        `${browserName} não suporta a API de leitura automática (BarcodeDetector). ` +
        'Use Chrome 83+, Edge 83+ ou Opera 69+ para escanear pela câmera ou foto. ' +
        'O campo de entrada manual abaixo funciona em qualquer navegador.'
      )
    }
  }, [])

  useEffect(() => () => {
    stopCamera()
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    trackToolAttempt('qr_reader')
    setError('')
    if (typeof BarcodeDetector === 'undefined') {
      const ua = navigator.userAgent
      const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
      const isFirefox = /Firefox/.test(ua)
      const name = isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'seu navegador'
      setError(
        `O ${name} não suporta leitura via câmera (API BarcodeDetector). ` +
        'Use o Chrome 83+, Edge 83+ ou Opera 69+. No iPhone, use o Google Chrome para iOS.'
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
      detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] })
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
            const analyzed = analyzeContent(bc.rawValue)
            queueMicrotask(() => {
              trackScan(bc.format)
              setShowShare(true)
              try { navigator.vibrate?.(100) } catch { /* vibration not supported */ }
            })
            return [{ value: bc.rawValue, timestamp: Date.now(), ...analyzed }, ...prev].slice(0, 50)
          })
        }
      } catch { /* skip frame errors */ }
      if (!cancelled) timerId = setTimeout(scanFrame, SCAN_INTERVAL_MS)
    }

    scanFrame()
    return () => {
      cancelled = true
      if (timerId) clearTimeout(timerId)
    }
  }, [isScanning])

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      trackCopy('qr_reader', 'scanned_code')
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(null), 2000)
    } catch {
      showToast('Não foi possível copiar. Selecione o texto manualmente.', 'error')
    }
  }

  const handleReadFromPhoto = useCallback(async (file: File) => {
    setError('')
    if (typeof BarcodeDetector === 'undefined') {
      const ua = navigator.userAgent
      const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
      const isFirefox = /Firefox/.test(ua)
      const name = isSafari ? 'Safari' : isFirefox ? 'Firefox' : 'seu navegador'
      setError(
        `O ${name} não suporta leitura automática (API BarcodeDetector). ` +
        'Use o Chrome 83+, Edge 83+ ou Opera 69+ para ler de foto.'
      )
      return
    }
    setIsProcessingImage(true)
    let bitmap: ImageBitmap | null = null
    try {
      bitmap = await createImageBitmap(file)
      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      const barcodes = await detector.detect(bitmap)
      if (barcodes.length === 0) {
        setError('Nenhum QR Code encontrado na imagem. Certifique-se que a imagem contém um QR Code nítido.')
        return
      }
      let added = 0
      setResults(prev => {
        let next = prev
        for (const bc of barcodes) {
          if (!next.some(r => r.value === bc.rawValue)) {
            const analyzed = analyzeContent(bc.rawValue)
            next = [{ value: bc.rawValue, timestamp: Date.now(), ...analyzed }, ...next].slice(0, 50)
            added++
            queueMicrotask(() => trackScan(bc.format))
          }
        }
        return next
      })
      if (added > 0) {
        setShowShare(true)
        showToast(
          added === 1 ? '1 QR Code encontrado na foto!' : `${added} QR Codes encontrados na foto!`,
          'success'
        )
      }
    } catch {
      setError('Erro ao processar a imagem. Tente novamente com outro arquivo.')
    } finally {
      if (bitmap) bitmap.close()
      setIsProcessingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [])

  const toggleWifiReveal = (index: number) => {
    setRevealedWifi(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {browserWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3" role="alert">
          <span className="text-amber-500 text-xl shrink-0" aria-hidden="true">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Navegador incompatível com leitura automática</p>
            <p className="text-sm text-amber-700">{browserWarning}</p>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Camera area */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 min-h-[300px]">
          <video
            ref={videoRef}
            className={`w-full ${isScanning ? '' : 'hidden'}`}
            playsInline
            muted
            aria-label="Feed da câmera para leitura de QR Code"
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
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                    <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                    <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
                    <path d="M14 14h3v3" />
                    <path d="M17 17h3v3" />
                    <path d="M14 20h3" />
                  </svg>
                  <p className="text-sm text-gray-300 text-center max-w-xs">
                    Aponte a câmera para um QR Code para leitura automática
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
            <>
              <button
                onClick={startCamera}
                disabled={isCameraLoading || isProcessingImage}
                className="flex-1 bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                {isCameraLoading ? 'Acessando…' : 'Iniciar Câmera'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleReadFromPhoto(file)
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isCameraLoading || isProcessingImage}
                className="flex-1 bg-white border border-sky-600 text-sky-600 px-4 py-2.5 rounded-lg font-medium hover:bg-sky-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                {isProcessingImage ? 'Processando…' : 'Ler de foto'}
              </button>
            </>
          ) : (
            <button
              onClick={stopCamera}
              className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Parar Câmera
            </button>
          )}
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {results.length > 0
          ? `${results.length} QR Code${results.length > 1 ? 's' : ''} detectado${results.length > 1 ? 's' : ''}. Último: ${results[0].value}`
          : ''}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              QR Codes detectados ({results.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-red-500 hover:text-red-700 min-h-[44px] px-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Limpar
            </button>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {results.map((r, i) => (
              <ResultCard
                key={`${r.value}-${i}`}
                result={r}
                index={i}
                copied={copied}
                wifiRevealed={revealedWifi.has(i)}
                onCopy={handleCopy}
                onToggleWifi={() => toggleWifiReveal(i)}
              />
            ))}
          </div>
        </div>
      )}

      <ShareBlock
        visible={showShare}
        toolSlug={SHARE.toolSlug}
        whatsappText={SHARE.whatsappText}
        shareUrl={SHARE.shareUrl}
      />
      <ConfirmDialog
        open={showClearConfirm}
        title="Limpar QR Codes"
        message="Tem certeza que deseja limpar todos os QR Codes detectados?"
        confirmLabel="Limpar"
        cancelLabel="Cancelar"
        onConfirm={() => { setResults([]); setShowClearConfirm(false); setRevealedWifi(new Set()) }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}
