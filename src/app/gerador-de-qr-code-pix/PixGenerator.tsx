'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { buildPixPayload, validatePixForm, KEY_TYPES, KEY_META, type PixKeyType } from '@/lib/pix'
import { trackGenerate, trackDownload, trackCopy } from '@/lib/analytics'
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
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const SHARE = getShareConfig('gerador-de-qr-code-pix')

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
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
