'use client'

import { useState } from 'react'
import { trackShare } from '@/lib/analytics'
import { SITE_URL } from '@/lib/constants'

interface BlogShareBlockProps {
  slug: string
  h1: string
  resumo?: string
}

export default function BlogShareBlock({ slug, h1, resumo }: BlogShareBlockProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `${SITE_URL}/blog/${slug}?utm_source=whatsapp&utm_medium=share&utm_campaign=blog_${slug}`
  const copyUrl = `${SITE_URL}/blog/${slug}?utm_source=copy&utm_medium=share&utm_campaign=blog_${slug}`
  const whatsappText = resumo
    ? `"${h1}" — ${resumo}\nLeia grátis: ${shareUrl}`
    : `"${h1}"\nLeia grátis: ${shareUrl}`

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank', 'noopener,noreferrer')
    trackShare('whatsapp', 'blog', slug)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(copyUrl)
    } catch {
      return /* clipboard API não disponível — ignora silenciosamente */
    }
    setCopied(true)
    trackShare('copy_link', 'blog', slug)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 my-6"
      role="complementary"
      aria-label="Compartilhar artigo"
    >
      <p className="text-sm font-medium text-gray-700 mb-2.5">Esse guia foi útil?</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleWhatsApp}
          aria-label="Compartilhar no WhatsApp"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 min-h-[40px]"
        >
          <span aria-hidden="true">📲</span> Compartilhar no WhatsApp
        </button>
        <button
          onClick={handleCopyLink}
          aria-label={copied ? 'Link copiado!' : 'Copiar link do artigo'}
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
