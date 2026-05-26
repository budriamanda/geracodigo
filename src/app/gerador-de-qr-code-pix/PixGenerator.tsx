'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { buildPixPayload, validatePixForm, KEY_TYPES, KEY_META, type PixKeyType } from '@/lib/pix'
import { trackGenerate, trackDownload, trackCopy, trackToolAttempt } from '@/lib/analytics'
import { incrementCount } from '@/lib/counter'
import { downloadDataUrl, downloadBlob } from '@/lib/download'
import ShareBlock from '@/components/ShareBlock'
import { getShareConfig } from '@/lib/share-config'
import { showToast } from '@/components/Toast'
import PreviewArea from '@/components/ui/PreviewArea'
import PrivacyChip from '@/components/ui/PrivacyChip'

type KeyType = PixKeyType

interface FieldErrors {
  key?: string
  name?: string
  city?: string
}

const inputBase = 'w-full border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 transition-colors'
const inputNormal = `${inputBase} border-gray-300 focus:ring-indigo-500`
const inputErr = `${inputBase} border-red-400 bg-red-50 focus:ring-red-400`

export default function PixGenerator() {
  const [keyType, setKeyType] = useState<KeyType>('EMAIL')
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [value, setValue] = useState('')
  const [txid, setTxid] = useState('')
  const [description, setDescription] = useState('')
  const [payload, setPayload] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<Partial<Record<keyof FieldErrors, boolean>>>({})
  const [valueCapped, setValueCapped] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copyLinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const SHARE = getShareConfig('gerador-de-qr-code-pix')

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    if (copyLinkTimeoutRef.current) clearTimeout(copyLinkTimeoutRef.current)
  }, [])

  const markStale = () => {
    if (isValid) {
      setIsValid(false)
    }
  }

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateKeyField = useCallback((currentKey: string, currentKeyType: KeyType): string | undefined => {
    return validatePixForm({ keyType: currentKeyType, key: currentKey, name: 'x', city: 'x' }).key
  }, [])

  const handleBlur = (field: keyof FieldErrors) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }))
    let error: string | undefined
    if (field === 'key') error = validateKeyField(key, keyType)
    else if (field === 'name') error = !name.trim() ? 'Informe o nome do recebedor' : undefined
    else if (field === 'city') error = !city.trim() ? 'Informe a cidade' : undefined
    setFieldErrors(prev => {
      if (!error) {
        const next = { ...prev }
        delete next[field]
        return next
      }
      return { ...prev, [field]: error }
    })
  }

  const isFieldValid = (field: keyof FieldErrors): boolean => {
    if (!touchedFields[field]) return false
    if (fieldErrors[field]) return false
    if (field === 'key') return !!key.trim()
    if (field === 'name') return !!name.trim()
    if (field === 'city') return !!city.trim()
    return false
  }

  const handleGenerate = useCallback(async () => {
    // Dispara tool_start na primeira tentativa da sessão, mesmo que a validação falhe.
    // Permite medir usuários que tentam usar a ferramenta mas não conseguem concluir.
    trackToolAttempt('pix_generator')

    const result = buildPixPayload({ keyType, key, name, city, value, txid, description })
    if (!result.ok) {
      setFieldErrors(result.errors)
      setQrDataUrl('')
      setPayload('')
      setIsValid(false)
      return
    }

    setFieldErrors({})
    setIsGenerating(true)
    setError('')
    try {
      setValueCapped(result.valueCapped)
      setPayload(result.payload)
      const dataUrl = await QRCode.toDataURL(result.payload, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      })
      setQrDataUrl(dataUrl)
      setIsValid(true)
      trackGenerate('pix_generator', keyType)
      incrementCount()
    } catch {
      setError('Erro ao gerar QR Code. Verifique os dados informados.')
      setIsValid(false)
    } finally {
      setIsGenerating(false)
    }
  }, [keyType, key, name, city, value, txid, description])

  const handleCopy = async () => {
    if (!payload) return
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
    } catch {
      try {
        const blob = new Blob([payload], { type: 'text/plain' })
        const item = new ClipboardItem({ 'text/plain': blob })
        await navigator.clipboard.write([item])
        setCopied(true)
      } catch {
        setError('Não foi possível copiar. Selecione o texto do payload manualmente.')
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = setTimeout(() => setError(''), 4000)
        return
      }
    }
    trackCopy('pix_generator', 'payload')
    showToast('Código Pix copiado', 'success')
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPng = () => {
    if (!qrDataUrl) return
    downloadDataUrl(qrDataUrl, 'qr-pix.png')
    trackDownload('pix_generator', 'pix', 'png')
    showToast('Download iniciado — PNG', 'success')
    setShowShare(true)
  }

  const handleDownloadSvg = async () => {
    if (!payload) return
    try {
      const svgString = await QRCode.toString(payload, { type: 'svg', width: 400, margin: 2 })
      downloadBlob(new Blob([svgString], { type: 'image/svg+xml' }), 'qr-pix.svg')
      trackDownload('pix_generator', 'pix', 'svg')
      showToast('Download iniciado — SVG', 'success')
      setShowShare(true)
    } catch {
      setError('Erro ao gerar SVG. Tente baixar em PNG.')
    }
  }

  const handleDownloadTemplate = useCallback((templateId: 'basico' | 'verde' | 'restaurante' | 'profissional') => {
    if (!qrDataUrl) return

    const canvas = document.createElement('canvas')
    canvas.width = 420
    canvas.height = 560
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, 420, 560)

      if (templateId === 'basico') {
        // Fundo branco com borda verde
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 420, 560)
        ctx.strokeStyle = '#16a34a'
        ctx.lineWidth = 6
        ctx.strokeRect(3, 3, 414, 554)

        // Círculo verde com PIX
        ctx.fillStyle = '#16a34a'
        ctx.beginPath()
        ctx.arc(210, 75, 52, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('PIX', 210, 75)

        // QR Code
        ctx.drawImage(img, 65, 130, 290, 290)

        // Rodapé
        ctx.fillStyle = '#6b7280'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('Aponte a câmera para pagar', 210, 460)
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText(name.trim() || 'Recebedor', 210, 490)

      } else if (templateId === 'verde') {
        // Fundo verde
        ctx.fillStyle = '#16a34a'
        ctx.fillRect(0, 0, 420, 560)

        // Textos de topo
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 32px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('ACEITE', 210, 65)
        ctx.font = 'bold 56px sans-serif'
        ctx.fillText('PIX', 210, 125)

        // Moldura branca para QR
        ctx.fillStyle = '#ffffff'
        const rx = 55, ry = 140, rw = 310, rh = 310, r = 12
        ctx.beginPath()
        ctx.moveTo(rx + r, ry)
        ctx.lineTo(rx + rw - r, ry)
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r)
        ctx.lineTo(rx + rw, ry + rh - r)
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh)
        ctx.lineTo(rx + r, ry + rh)
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r)
        ctx.lineTo(rx, ry + r)
        ctx.quadraticCurveTo(rx, ry, rx + r, ry)
        ctx.closePath()
        ctx.fill()

        // QR Code dentro da moldura
        ctx.drawImage(img, 65, 150, 290, 290)

        // Rodapé
        ctx.fillStyle = '#bbf7d0'
        ctx.font = '18px sans-serif'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('pagamento instantâneo', 210, 490)

      } else if (templateId === 'restaurante') {
        // Fundo laranja claro
        ctx.fillStyle = '#fff7ed'
        ctx.fillRect(0, 0, 420, 560)

        // Linha decorativa laranja no topo
        ctx.fillStyle = '#f97316'
        ctx.fillRect(0, 0, 420, 4)

        // Textos de topo
        ctx.fillStyle = '#9a3412'
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('PAGUE SUA CONTA', 210, 65)
        ctx.fillStyle = '#f97316'
        ctx.font = 'italic bold 38px sans-serif'
        ctx.fillText('com Pix', 210, 115)

        // QR Code
        ctx.drawImage(img, 65, 140, 290, 290)

        // Rodapé
        ctx.font = '16px sans-serif'
        ctx.fillStyle = '#6b7280'
        ctx.fillText('Recebedor:', 210, 470)
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 20px sans-serif'
        ctx.fillText(name.trim() || 'Recebedor', 210, 498)

      } else if (templateId === 'profissional') {
        // Fundo indigo escuro
        ctx.fillStyle = '#1e1b4b'
        ctx.fillRect(0, 0, 420, 560)

        // Textos de topo
        ctx.fillStyle = '#a5b4fc'
        ctx.font = '18px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('PAGAMENTO VIA', 210, 60)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 52px sans-serif'
        ctx.fillText('PIX', 210, 120)

        // Moldura branca arredondada para QR
        ctx.fillStyle = '#ffffff'
        const rx2 = 55, ry2 = 140, rw2 = 310, rh2 = 310, r2 = 12
        ctx.beginPath()
        ctx.moveTo(rx2 + r2, ry2)
        ctx.lineTo(rx2 + rw2 - r2, ry2)
        ctx.quadraticCurveTo(rx2 + rw2, ry2, rx2 + rw2, ry2 + r2)
        ctx.lineTo(rx2 + rw2, ry2 + rh2 - r2)
        ctx.quadraticCurveTo(rx2 + rw2, ry2 + rh2, rx2 + rw2 - r2, ry2 + rh2)
        ctx.lineTo(rx2 + r2, ry2 + rh2)
        ctx.quadraticCurveTo(rx2, ry2 + rh2, rx2, ry2 + rh2 - r2)
        ctx.lineTo(rx2, ry2 + r2)
        ctx.quadraticCurveTo(rx2, ry2, rx2 + r2, ry2)
        ctx.closePath()
        ctx.fill()

        // QR Code dentro da moldura
        ctx.drawImage(img, 65, 150, 290, 290)

        // Rodapé
        ctx.fillStyle = '#c7d2fe'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText(name.trim() || 'Recebedor', 210, 490)
        ctx.fillStyle = '#6366f1'
        ctx.font = '11px sans-serif'
        ctx.fillText('geracodigo.com.br', 210, 520)
      }

      canvas.toBlob(blob => {
        if (blob) {
          downloadBlob(blob, `placa-pix-${templateId}.png`)
          trackDownload('pix_generator', 'pix', `template-${templateId}`)
          showToast('Download iniciado — Placa Pix PNG', 'success')
        }
      }, 'image/png')
    }
    img.src = qrDataUrl
  }, [qrDataUrl, name])

  const handleCopyLink = useCallback(async () => {
    const { SITE_URL } = await import('@/lib/constants')
    const link = `${SITE_URL}/pagar?t=${keyType}&k=${encodeURIComponent(key)}&n=${encodeURIComponent(name.trim())}&c=${encodeURIComponent(city.trim())}${value && parseFloat(value) > 0 ? `&v=${value}` : ''}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(true)
      showToast('Link copiado! Compartilhe pelo WhatsApp ou e-mail', 'success')
      if (copyLinkTimeoutRef.current) clearTimeout(copyLinkTimeoutRef.current)
      copyLinkTimeoutRef.current = setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      showToast('Não foi possível copiar o link.', 'error')
    }
  }, [keyType, key, name, city, value])

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados do Pix</h2>
        <p className="text-xs text-gray-400 mb-4">Campos com <span className="text-red-500">*</span> são obrigatórios</p>

        <fieldset className="space-y-4 border-0 p-0 m-0" onKeyDown={e => { if (e.key === 'Enter' && !isGenerating && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) handleGenerate() }}>
          <legend className="sr-only">Dados do Pix</legend>

          {/* Tipo de chave */}
          <div>
            <label htmlFor="pix-key-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de chave Pix</label>
            <select
              id="pix-key-type"
              value={keyType}
              onChange={e => {
                setKeyType(e.target.value as KeyType)
                setKey('')
                clearFieldError('key')
                markStale()
              }}
              className={inputNormal}
            >
              {KEY_TYPES.map(k => (
                <option key={k} value={k}>{KEY_META[k].label}</option>
              ))}
            </select>
          </div>

          {/* Chave Pix */}
          <div>
            <label htmlFor="pix-key" className="block text-sm font-medium text-gray-700 mb-1">
              Chave Pix <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="pix-key"
                type="text"
                value={key}
                onChange={e => { setKey(e.target.value); clearFieldError('key'); markStale() }}
                onBlur={() => handleBlur('key')}
                placeholder={KEY_META[keyType].placeholder}
                maxLength={KEY_META[keyType].maxLength}
                className={`${fieldErrors.key ? inputErr : inputNormal} pr-8`}
                aria-required="true"
                aria-invalid={!!fieldErrors.key}
                aria-describedby={fieldErrors.key ? 'pix-key-error' : undefined}
              />
              {isFieldValid('key') && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500 text-sm" aria-hidden="true">✓</span>
              )}
              {fieldErrors.key && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500 text-sm" aria-hidden="true">✕</span>
              )}
            </div>
            {fieldErrors.key && (
              <p id="pix-key-error" className="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {fieldErrors.key}
              </p>
            )}
          </div>

          {/* Nome */}
          <div>
            <label htmlFor="pix-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do recebedor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="pix-name"
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); clearFieldError('name'); markStale() }}
                onBlur={() => handleBlur('name')}
                placeholder="Seu Nome ou Empresa"
                maxLength={25}
                className={`${fieldErrors.name ? inputErr : inputNormal} pr-8`}
                aria-required="true"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={`pix-name-hint${fieldErrors.name ? ' pix-name-error' : ''}`}
              />
              {isFieldValid('name') && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500 text-sm" aria-hidden="true">✓</span>
              )}
              {fieldErrors.name && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500 text-sm" aria-hidden="true">✕</span>
              )}
            </div>
            <div className="flex justify-between mt-1">
              {fieldErrors.name ? (
                <p id="pix-name-error" className="text-red-600 text-xs flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span> {fieldErrors.name}
                </p>
              ) : <span />}
              <span id="pix-name-hint" className={`text-xs tabular-nums ${name.length >= 25 ? 'text-amber-600' : 'text-gray-400'}`} aria-live="polite">
                {name.length}/25
              </span>
            </div>
          </div>

          {/* Cidade */}
          <div>
            <label htmlFor="pix-city" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="pix-city"
                type="text"
                value={city}
                onChange={e => { setCity(e.target.value); clearFieldError('city'); markStale() }}
                onBlur={() => handleBlur('city')}
                placeholder="São Paulo"
                maxLength={15}
                className={`${fieldErrors.city ? inputErr : inputNormal} pr-8`}
                aria-required="true"
                aria-invalid={!!fieldErrors.city}
                aria-describedby={`pix-city-hint${fieldErrors.city ? ' pix-city-error' : ''}`}
              />
              {isFieldValid('city') && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500 text-sm" aria-hidden="true">✓</span>
              )}
              {fieldErrors.city && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500 text-sm" aria-hidden="true">✕</span>
              )}
            </div>
            <div className="flex justify-between mt-1">
              {fieldErrors.city ? (
                <p id="pix-city-error" className="text-red-600 text-xs flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span> {fieldErrors.city}
                </p>
              ) : <span />}
              <span id="pix-city-hint" className={`text-xs tabular-nums ${city.length >= 15 ? 'text-amber-600' : 'text-gray-400'}`} aria-live="polite">
                {city.length}/15
              </span>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label htmlFor="pix-value" className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$){' '}
              <span className="text-gray-400 font-normal">(opcional, deixe vazio para valor aberto)</span>
            </label>
            <input
              id="pix-value"
              type="number"
              value={value}
              onChange={e => { setValue(e.target.value); setValueCapped(false); markStale() }}
              onKeyDown={e => { if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault() }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={inputNormal}
            />
            {valueCapped && (
              <p className="text-amber-600 text-xs mt-1">Valor máximo permitido: R$ 999.999,99. O valor foi ajustado automaticamente.</p>
            )}
          </div>

          {/* TXID */}
          <div>
            <label htmlFor="pix-txid" className="block text-sm font-medium text-gray-700 mb-1">
              Identificador da transação{' '}
              <span className="text-gray-400 font-normal">(opcional, máx. 25 chars)</span>
            </label>
            <input
              id="pix-txid"
              type="text"
              value={txid}
              onChange={e => { setTxid(e.target.value); markStale() }}
              placeholder="PEDIDO001"
              maxLength={25}
              className={inputNormal}
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="pix-description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição{' '}
              <span className="text-gray-400 font-normal">(opcional, máx. 40 chars)</span>
            </label>
            <input
              id="pix-description"
              type="text"
              value={description}
              onChange={e => { setDescription(e.target.value); markStale() }}
              placeholder="Pagamento do pedido"
              maxLength={40}
              className={inputNormal}
            />
          </div>

          {/* Botão */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {isGenerating ? 'Gerando…' : 'Gerar QR Code Pix'}
          </button>
          <PrivacyChip />
        </fieldset>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col gap-4">
        <PreviewArea
          title="Preview do QR Code"
          hasContent={!!qrDataUrl}
          emptyText={error || 'Preencha os campos e clique em Gerar'}
          ariaLiveText={isValid ? 'QR Code Pix gerado com sucesso' : ''}
          className="flex-none w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada dinamicamente, next/image nao aplica */}
          <img
            src={qrDataUrl!}
            alt="QR Code Pix gerado com payload BR Code válido"
            width={192}
            height={192}
            className="w-48 h-48 rounded-lg animate-fade-in"
          />
          {isValid && (
            <>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">
                ✓ QR válido, testado com o padrão Banco Central
              </span>
              <dl className="w-full text-xs text-gray-600 space-y-1 border border-gray-100 rounded-lg px-3 py-2 bg-gray-50">
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400 shrink-0">Recebedor</dt>
                  <dd className="font-medium text-right truncate">{name.trim()}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400 shrink-0">Cidade</dt>
                  <dd className="font-medium text-right">{city.trim()}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-400 shrink-0">Chave</dt>
                  <dd className="font-medium text-right truncate">{KEY_META[keyType].label}: {key.trim()}</dd>
                </div>
                {value && parseFloat(value) > 0 && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-gray-400 shrink-0">Valor</dt>
                    <dd className="font-medium text-right">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.min(parseFloat(value), 999999.99))}
                    </dd>
                  </div>
                )}
              </dl>
            </>
          )}
          {error && <p className="text-red-600 text-xs text-center" role="alert">{error}</p>}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleDownloadPng}
              aria-label="Baixar QR Code Pix em formato PNG"
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Download PNG
            </button>
            <button
              onClick={handleDownloadSvg}
              aria-label="Baixar QR Code Pix em formato SVG"
              className="flex-1 bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Download SVG
            </button>
            <a
              href={`mailto:?subject=${encodeURIComponent('QR Code Pix para pagamento')}&body=${encodeURIComponent('Segue o QR Code Pix. Baixe a imagem pelo link abaixo e apresente ao cliente para pagamento:\nhttps://www.geracodigo.com.br/gerador-de-qr-code-pix')}`}
              aria-label="Enviar QR Code por e-mail"
              title="Abre o cliente de e-mail — nenhum dado passa pelo GeraCode"
              className="flex-none bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            >
              ✉️
            </a>
          </div>
        </PreviewArea>

        {payload && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="pix-payload" className="text-sm font-semibold text-gray-700">Payload BR Code</label>
              <button
                onClick={handleCopy}
                aria-label={copied ? 'Payload copiado' : 'Copiar payload BR Code'}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {copied ? '✓ Copiado!' : 'Copiar payload'}
              </button>
            </div>
            <textarea
              id="pix-payload"
              readOnly
              value={payload}
              className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 h-24 resize-none focus:outline-none"
            />
          </div>
        )}

        {isValid && (
          <>
            {/* Botão copiar link */}
            <button
              onClick={handleCopyLink}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                copiedLink
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {copiedLink ? '✓ Link copiado!' : 'Copiar link de pagamento'}
            </button>

            {/* Placas Pix */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Baixar placa Pix</h3>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: 'basico', label: 'Básico', bg: 'bg-white border-2 border-green-600', textColor: 'text-green-700' },
                    { id: 'verde', label: 'Verde', bg: 'bg-green-600', textColor: 'text-white' },
                    { id: 'restaurante', label: 'Restaurante', bg: 'bg-orange-50 border-2 border-orange-300', textColor: 'text-orange-700' },
                    { id: 'profissional', label: 'Profissional', bg: 'bg-indigo-950', textColor: 'text-indigo-200' },
                  ] as const
                ).map(t => (
                  <div key={t.id} className={`rounded-lg p-3 flex flex-col items-center gap-2 ${t.bg}`}>
                    <span className={`text-xs font-semibold ${t.textColor}`}>{t.label}</span>
                    <button
                      onClick={() => handleDownloadTemplate(t.id)}
                      className="w-full bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    >
                      Baixar PNG
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <ShareBlock visible={showShare} toolSlug={SHARE.toolSlug} whatsappText={SHARE.whatsappText} shareUrl={SHARE.shareUrl} />
      </div>

      {qrDataUrl && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-white border border-indigo-600 text-indigo-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors min-h-[44px]"
          >
            {copied ? '✓ Copiado' : 'Copiar código'}
          </button>
          <button
            onClick={handleDownloadPng}
            className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors min-h-[44px]"
          >
            Baixar PNG
          </button>
        </div>
      )}
    </div>
  )
}
