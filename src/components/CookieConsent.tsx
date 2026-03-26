'use client'

import { useSyncExternalStore, useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getConsent, saveConsent, applyConsent } from '@/lib/consent'

const noopSubscribe = (_cb: () => void) => () => {}
const getHasConsent = () => getConsent() !== null
const serverSnapshot = () => true

export default function CookieConsent() {
  const hasConsent = useSyncExternalStore(noopSubscribe, getHasConsent, serverSnapshot)

  const [dismissed, setDismissed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [advertising, setAdvertising] = useState(false)

  const appliedRef = useRef(false)
  useEffect(() => {
    if (appliedRef.current) return
    appliedRef.current = true
    const existing = getConsent()
    if (existing) {
      applyConsent(existing)
    }
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setShowSettings(false)
  }, [])

  const handleAcceptAll = useCallback(() => {
    saveConsent({ analytics: true, advertising: true })
    dismiss()
  }, [dismiss])

  const handleRejectAll = useCallback(() => {
    saveConsent({ analytics: false, advertising: false })
    dismiss()
  }, [dismiss])

  const handleSavePreferences = useCallback(() => {
    saveConsent({ analytics, advertising })
    dismiss()
  }, [analytics, advertising, dismiss])

  const handleOpenSettings = useCallback(() => {
    const existing = getConsent()
    if (existing) {
      setAnalytics(existing.analytics)
      setAdvertising(existing.advertising)
    }
    setShowSettings(true)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false)
  }, [])

  const isVisible = !hasConsent && !dismissed

  if (!isVisible && !showSettings) return null

  if (showSettings) {
    return (
      <div
        role="dialog"
        aria-label="Preferências de cookies"
        aria-modal="true"
        className="fixed inset-0 z-[9999] flex items-end justify-center"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
          onClick={handleCloseSettings}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-2xl mx-4 mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Preferências de Cookies
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Escolha quais cookies deseja permitir. Cookies essenciais não podem ser desativados.
            </p>

            <div className="space-y-4 mb-6">
              <CookieCategory
                title="Cookies Essenciais"
                description="Necessários para o funcionamento básico do site, como cache de arquivos estáticos (Service Worker) e armazenamento local do histórico."
                checked={true}
                disabled={true}
              />
              <CookieCategory
                title="Cookies de Análise"
                description="Google Analytics 4 — nos ajudam a entender como o site é utilizado para melhorar a experiência. Dados anonimizados de navegação."
                checked={analytics}
                onChange={setAnalytics}
              />
              <CookieCategory
                title="Cookies de Publicidade"
                description="Google AdSense — permitem exibir anúncios relevantes e manter o serviço gratuito. Podem personalizar anúncios com base nos seus interesses."
                checked={advertising}
                onChange={setAdvertising}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Salvar preferências
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 pointer-events-none"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 pointer-events-auto animate-slide-up">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-lg" aria-hidden="true">
              🍪
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Respeitamos sua privacidade
              </h2>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                Utilizamos cookies para análise de uso e exibição de anúncios.
                Nenhum cookie não essencial é ativado sem o seu consentimento.{' '}
                <Link href="/privacidade" className="text-indigo-600 hover:underline font-medium">
                  Política de Privacidade
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Aceitar todos
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Rejeitar não essenciais
            </button>
            <button
              onClick={handleOpenSettings}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Personalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CookieCategory({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange?: (v: boolean) => void
}) {
  const id = title.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
          {title}
          {disabled && (
            <span className="ml-2 text-xs text-gray-400 font-normal">(sempre ativo)</span>
          )}
        </label>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
          className="sr-only peer"
        />
        <div className={`
          w-11 h-6 rounded-full transition-colors
          ${disabled
            ? 'bg-indigo-400 cursor-not-allowed'
            : 'bg-gray-300 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2 cursor-pointer'
          }
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
          after:rounded-full after:h-5 after:w-5 after:transition-transform
          peer-checked:after:translate-x-5
        `} />
      </label>
    </div>
  )
}
