'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { trackCtaClick } from '@/lib/analytics'
import { Barcode, Hash, QrCode, ScanBarcode, Tag, BookOpen, type LucideIcon } from 'lucide-react'

export type NavLink = { href: string; label: string }

const NAV_ICONS: Record<string, LucideIcon> = {
  '/gerador-de-codigo-de-barras': Barcode,
  '/gerador-de-ean': Hash,
  '/gerador-de-qr-code-pix': QrCode,
  '/gerador-de-qr-code': QrCode,
  '/leitor-de-codigo-de-barras': ScanBarcode,
  '/gerador-de-sku': Tag,
  '/blog': BookOpen,
}

const defaultNavLinks: NavLink[] = [
  { href: '/gerador-de-codigo-de-barras', label: 'Código de Barras' },
  { href: '/gerador-de-ean', label: 'EAN-13 / EAN-8' },
  { href: '/gerador-de-qr-code-pix', label: 'QR Code Pix' },
  { href: '/gerador-de-qr-code', label: 'QR Code' },
  { href: '/leitor-de-codigo-de-barras', label: 'Leitor' },
  { href: '/gerador-de-sku', label: 'SKU' },
  { href: '/blog', label: 'Blog' },
]

export default function Header({ navLinks = defaultNavLinks }: { navLinks?: NavLink[] }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false))
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'

    const firstLink = menuRef.current?.querySelector<HTMLElement>('a[href]')
    firstLink?.focus()

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        toggleBtnRef.current?.focus()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        toggleBtnRef.current?.focus()
      }
    }
    function handleFocusTrap(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !menuRef.current) return
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleFocusTrap)
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      window.scrollTo(0, scrollY)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleFocusTrap)
    }
  }, [menuOpen])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Pular para o conteúdo
      </a>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-indigo-600">GeraCode</span>
            </Link>
            <nav
              className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600"
              aria-label="Navegação principal"
            >
              <ul role="list" className="flex items-center gap-6">
                {navLinks.map(({ href, label }) => {
                  const isActive = pathname === href
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`transition-colors ${
                          isActive
                            ? 'text-indigo-600 font-semibold'
                            : 'hover:text-indigo-600'
                        }`}
                        onClick={() => trackCtaClick(undefined, `nav_desktop_${href}`, label)}
                      >
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="md:hidden" ref={menuRef}>
              <button
                ref={toggleBtnRef}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>

              {menuOpen && (
                <nav
                  id="mobile-nav"
                  className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
                  aria-label="Navegação mobile"
                >
                  <ul role="list" className="px-4 py-3 space-y-1">
                    {navLinks.map(({ href, label }) => {
                      const isActive = pathname === href
                      const Icon = NAV_ICONS[href]
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                            }`}
                            onClick={() => trackCtaClick(undefined, `nav_mobile_${href}`, label)}
                          >
                            {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
                            {label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
