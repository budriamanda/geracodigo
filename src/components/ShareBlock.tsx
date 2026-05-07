'use client'

import { useState } from 'react'
import { trackShare } from '@/lib/analytics'

interface ShareBlockProps {
  toolSlug: string
  whatsappText: string
  shareUrl: string
  visible: boolean
}

export default function ShareBlock({ toolSlug, whatsappText, shareUrl, visible }: ShareBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank', 'noopener,noreferrer')
    trackShare('whatsapp', 'tool', toolSlug)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = shareUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    trackShare('copy_link', 'tool', toolSlug)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!visible) return <div className="min-h-0" aria-hidden="true" />

  return (
    <div
      className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 mt-3 animate-fade-in"
      role="complementary"
      aria-label="Compartilhar ferramenta"
    >
      <p className="text-sm font-medium text-gray-700 mb-2.5">
        Conhece outro lojista que precisaria disso?
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleWhatsApp}
          aria-label="Indicar pelo WhatsApp"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 min-h-[40px]"
        >
          <span aria-hidden="true">📲</span> Indicar pelo WhatsApp
        </button>
        <button
          onClick={handleCopyLink}
          aria-label={copied ? 'Link copiado!' : 'Copiar link da ferramenta'}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 min-h-[40px]"
        >
          <span aria-hidden="true">{copied ? '✓' : '🔗'}</span>
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2" aria-live="polite">
        {copied ? 'Link copiado para a área de transferência.' : ''}
      </p>
    </div>
  )
}
