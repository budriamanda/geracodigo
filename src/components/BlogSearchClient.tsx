'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import BlogIndex, { CATEGORIA_COLOR, type BlogIndexEntry } from './BlogIndex'

interface BlogSearchClientProps {
  posts: BlogIndexEntry[]
  initialQuery?: string
  activeCategory?: string
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const CATEGORIAS = [
  { value: '', label: 'Todos' },
  { value: 'pix', label: 'QR Code Pix' },
  { value: 'codigo-barras', label: 'Código de Barras' },
  { value: 'ean', label: 'EAN' },
  { value: 'sku', label: 'SKU' },
  { value: 'leitor', label: 'Leitor' },
  { value: 'qr-code', label: 'QR Code' },
  { value: 'geral', label: 'Geral' },
]

export default function BlogSearchClient({ posts, initialQuery = '', activeCategory }: BlogSearchClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return posts
    return posts.filter((p) => {
      const haystack = normalize(
        [p.title, p.h1, p.resumo, p.subtitle, p.categoria, p.persona].join(' ')
      )
      return q.split(' ').every((word) => haystack.includes(word))
    })
  }, [posts, query])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      setPage(1)

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const trimmed = value.trim()
        const base = activeCategory ? `/blog/categoria/${activeCategory}` : '/blog'
        const url = trimmed ? `${base}?q=${encodeURIComponent(trimmed)}` : base
        router.replace(url, { scroll: false })
      }, 300)
    },
    [router, activeCategory]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    setPage(1)
    const base = activeCategory ? `/blog/categoria/${activeCategory}` : '/blog'
    router.replace(base, { scroll: false })
  }, [router, activeCategory])

  // Category pill counts (relative to posts passed in, which may already be filtered server-side)
  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of posts) {
      if (p.categoria) map[p.categoria] = (map[p.categoria] ?? 0) + 1
    }
    return map
  }, [posts])

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIAS.map(({ value, label }) => {
          const isActive = (value === '' && !activeCategory) || value === activeCategory
          const href = value === '' ? '/blog' : `/blog/categoria/${value}`
          const colorClass = value ? (CATEGORIA_COLOR[value] ?? 'bg-gray-100 text-gray-700') : ''

          return (
            <Link
              key={value}
              href={href}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : `${colorClass || 'bg-gray-100 text-gray-700'} hover:opacity-80`
              }`}
            >
              {label}
              {value && countByCategory[value] !== undefined && !activeCategory && (
                <span className={`text-xs ${isActive ? 'text-indigo-200' : 'opacity-60'}`}>
                  {countByCategory[value]}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Search input */}
      <div className="relative mb-8">
        <label htmlFor="blog-search" className="sr-only">
          Buscar posts
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            id="blog-search"
            type="search"
            name="q"
            value={query}
            onChange={handleChange}
            placeholder="Buscar: pix, ean-13, qr code wifi, etiqueta…"
            autoComplete="off"
            className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            aria-label="Buscar posts no blog"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar busca"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>

        {query.trim() && (
          <p className="mt-2 text-sm text-gray-500">
            {filtered.length === 0
              ? `Nenhum resultado para "${query.trim()}"`
              : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${query.trim()}"`}
          </p>
        )}
      </div>

      <BlogIndex posts={filtered} query={query} page={page} onPageChange={setPage} />
    </div>
  )
}
