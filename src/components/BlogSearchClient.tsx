'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import BlogIndex, { type BlogIndexEntry } from './BlogIndex'

interface BlogSearchClientProps {
  posts: BlogIndexEntry[]
  initialQuery?: string
}

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export default function BlogSearchClient({ posts, initialQuery = '' }: BlogSearchClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
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

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const trimmed = value.trim()
        const url = trimmed ? `/blog?q=${encodeURIComponent(trimmed)}` : '/blog'
        router.replace(url, { scroll: false })
      }, 300)
    },
    [router]
  )

  const handleClear = useCallback(() => {
    setQuery('')
    router.replace('/blog', { scroll: false })
  }, [router])

  return (
    <div>
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
            placeholder="Buscar posts: pix, ean-13, etiqueta, mei…"
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

        {/* Result count */}
        {query.trim() && (
          <p className="mt-2 text-sm text-gray-500">
            {filtered.length === 0
              ? `Nenhum resultado para "${query.trim()}"`
              : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${query.trim()}"`}
          </p>
        )}
      </div>

      {/* Post grid */}
      <BlogIndex posts={filtered} query={query} />
    </div>
  )
}
