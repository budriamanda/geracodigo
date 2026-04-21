'use client'

import Link from 'next/link'
import { useCallback } from 'react'

export type FooterLink = { href: string; label: string }

export interface FooterProps {
  ferramentas?: FooterLink[]
  conteudo?: FooterLink[]
  institucional?: FooterLink[]
  tagline?: string
  copyrightText?: string
}

const defaultFerramentas: FooterLink[] = [
  { href: '/gerador-de-codigo-de-barras', label: 'Código de Barras' },
  { href: '/gerador-de-ean', label: 'EAN-13 / EAN-8' },
  { href: '/gerador-de-qr-code-pix', label: 'QR Code Pix' },
  { href: '/gerador-de-qr-code', label: 'QR Code' },
  { href: '/leitor-de-codigo-de-barras', label: 'Leitor de Código de Barras' },
  { href: '/gerador-de-sku', label: 'Gerador de SKU' },
]

const defaultConteudo: FooterLink[] = [
  { href: '/blog', label: 'Blog' },
]

const defaultInstitucional: FooterLink[] = [
  { href: '/sobre', label: 'Sobre' },
  { href: '/privacidade', label: 'Privacidade' },
  { href: '/termos', label: 'Termos de Uso' },
]

export default function Footer({
  ferramentas = defaultFerramentas,
  conteudo = defaultConteudo,
  institucional = defaultInstitucional,
  tagline = 'Ferramentas gratuitas de geração de código de barras e QR Code Pix para lojistas brasileiros. 100% privado, sem cadastro.',
  copyrightText = 'GeraCode · Ferramentas gratuitas para lojistas brasileiros',
}: FooterProps) {
  const handleCookiePreferences = useCallback(() => {
    window.dispatchEvent(new CustomEvent('geracode:open-cookie-settings'))
  }, [])

  return (
    <footer className="bg-white border-t-2 border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Ferramentas</h2>
            <ul className="space-y-2">
              {ferramentas.map(({ href, label }) => (
                <li key={href}><Link href={href} className="hover:text-indigo-600">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Conteúdo</h2>
            <ul className="space-y-2">
              {conteudo.map(({ href, label }) => (
                <li key={href}><Link href={href} className="hover:text-indigo-600">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">GeraCode</h2>
            <ul className="space-y-2">
              {institucional.map(({ href, label }) => (
                <li key={href}><Link href={href} className="hover:text-indigo-600">{label}</Link></li>
              ))}
              <li>
                <button
                  onClick={handleCookiePreferences}
                  className="hover:text-indigo-600 cursor-pointer text-left focus-visible:outline-none focus-visible:text-indigo-600 focus-visible:underline"
                >
                  Preferências de Cookies
                </button>
              </li>
            </ul>
            <p className="text-gray-500 text-xs leading-relaxed mt-3">
              {tagline}
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {copyrightText}
        </div>
      </div>
    </footer>
  )
}
