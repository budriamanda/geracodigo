'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import BlogIndex, { CATEGORIA_COLOR, CATEGORIA_LABEL, type BlogIndexEntry } from './BlogIndex'

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

const PERSONAS = [
  { value: '', label: 'Todos os perfis' },
  { value: 'mei', label: 'MEI / Autônomo' },
  { value: 'lojista-ecommerce', label: 'E-commerce' },
  { value: 'lojista-fisico', label: 'Loja Física' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'dev', label: 'Dev' },
]

const SORT_OPTIONS = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'atualizados', label: 'Atualizados recentemente' },
]

type SortOption = 'recentes' | 'atualizados'

export default function BlogSearchClient({ posts, initialQuery = '', activeCategory }: BlogSearchClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(1)
  const [personaFilter, setPersonaFilter] = useState('')
  const [sort, setSort] = useState<SortOption>('recentes')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter by query + persona
  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    let result = posts

    if (q) {
      result = result.filter((p) => {
        const haystack = normalize(
          [p.title, p.h1, p.resumo, p.subtitle, p.categoria, p.persona].join(' ')
        )
        return q.split(' ').every((word) => haystack.includes(word))
      })
    }

    if (personaFilter) {
      result = result.filter((p) => p.persona === personaFilter)
    }

    return result
  }, [posts, query, personaFilter])

  // Sort filtered results
  const sorted = useMemo(() => {
    if (sort === 'atualizados') {
      return [...filtered].sort((a, b) => {
        const aDate = a.dataAtualizacaoIso ?? a.dataPublicacaoIso
        const bDate = b.dataAtualizacaoIso ?? b.dataPublicacaoIso
        return bDate > aDate ? 1 : -1
      })
    }
    return filtered
  }, [filtered, sort])

  // Autocomplete suggestions (max 6, only when typing)
  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return []
    return filtered.slice(0, 6)
  }, [filtered, query])

  // Category pill counts
  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of posts) {
      if (p.categoria) map[p.categoria] = (map[p.categoria] ?? 0) + 1
    }
    return map
  }, [posts])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      setPage(1)
      setShowSuggestions(true)

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
    setShowSuggestions(false)
    const base = activeCategory ? `/blog/categoria/${activeCategory}` : '/blog'
    router.replace(base, { scroll: false })
  }, [router, activeCategory])

  const handleSearchBlur = useCallback(() => {
    // Delay allows click on suggestion to register before hiding
    setTimeout(() => setShowSuggestions(false), 150)
  }, [])

  const handleSuggestionClick = useCallback(() => {
    setShowSuggestions(false)
    setQuery('')
  }, [])

  const handlePersonaChange = useCallback((value: string) => {
    setPersonaFilter(value)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOption)
    setPage(1)
  }, [])

  const hasActiveFilters = personaFilter !== '' || sort !== 'recentes'

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Persona pills + Sort row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5 border-b border-gray-100">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mr-1">Para:</span>
          {PERSONAS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handlePersonaChange(value)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors font-medium border ${
                personaFilter === value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={handleSortChange}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
          aria-label="Ordenar posts"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Search input with autocomplete */}
      <div className="relative mb-8">
        <label htmlFor="blog-search" className="sr-only">Buscar posts</label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            id="blog-search"
            type="search"
            name="q"
            value={query}
            onChange={handleChange}
            onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
            onBlur={handleSearchBlur}
            placeholder="Buscar: pix, ean-13, qr code wifi, etiqueta…"
            autoComplete="off"
            className="block w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-10 text-base text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            role="combobox"
            aria-label="Buscar posts no blog"
            aria-autocomplete="list"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls="blog-search-suggestions"
            aria-haspopup="listbox"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar busca"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            id="blog-search-suggestions"
            role="listbox"
            aria-label="Sugestões de posts"
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
          >
            {suggestions.map((post) => (
              <li key={post.slug} role="option" aria-selected="false">
                <Link
                  href={`/blog/${post.slug}`}
                  onClick={handleSuggestionClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <svg className="w-4 h-4 text-gray-300 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                  </svg>
                  <span className="flex-1 text-sm text-gray-800 truncate font-medium">{post.h1 || post.title}</span>
                  {post.categoria && (
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORIA_COLOR[post.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
                      {CATEGORIA_LABEL[post.categoria]}
                    </span>
                  )}
                </Link>
              </li>
            ))}
            <li className="px-4 py-2 text-xs text-gray-400 bg-gray-50 text-center">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} — pressione Enter para ver todos
            </li>
          </ul>
        )}

        {/* Result count (when no suggestions shown) */}
        {query.trim() && !showSuggestions && (
          <p className="mt-2 text-sm text-gray-500">
            {filtered.length === 0
              ? `Nenhum resultado para "${query.trim()}"`
              : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${query.trim()}"`}
          </p>
        )}
      </div>

      {/* Active filter summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>Filtros ativos:</span>
          {personaFilter && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {PERSONAS.find((p) => p.value === personaFilter)?.label}
              <button type="button" onClick={() => handlePersonaChange('')} className="text-gray-400 hover:text-gray-600 ml-0.5" aria-label="Remover filtro de persona">×</button>
            </span>
          )}
          {sort !== 'recentes' && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
              <button type="button" onClick={() => { setSort('recentes'); setPage(1) }} className="text-gray-400 hover:text-gray-600 ml-0.5" aria-label="Remover ordenação">×</button>
            </span>
          )}
          <button type="button" onClick={() => { handlePersonaChange(''); setSort('recentes') }} className="text-indigo-600 hover:underline text-xs ml-1">
            Limpar tudo
          </button>
        </div>
      )}

      <BlogIndex posts={sorted} query={query} page={page} onPageChange={setPage} />
    </div>
  )
}
