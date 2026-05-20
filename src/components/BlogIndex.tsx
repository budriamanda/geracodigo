import Image from 'next/image'
import Link from 'next/link'
import { formatDateMonthYear } from '@/lib/dates'

export interface BlogIndexEntry {
  slug: string
  title: string
  h1: string
  resumo?: string
  subtitle?: string
  categoria?: string
  persona?: string
  dataPublicacaoHumana: string
  dataPublicacaoIso: string
  dataAtualizacaoHumana?: string
  dataAtualizacaoIso?: string
  tempoLeitura?: number
  ferramentaRelacionadaSlug?: string
  ferramentaRelacionadaTitulo?: string
  featured?: boolean
  autor?: string
  heroImage?: string
}

interface BlogIndexProps {
  posts: BlogIndexEntry[]
  query?: string
  page?: number
  onPageChange?: (page: number) => void
}

const POSTS_PER_PAGE = 12

export const CATEGORIA_LABEL: Record<string, string> = {
  pix: 'QR Code Pix',
  'codigo-barras': 'Código de Barras',
  ean: 'EAN',
  sku: 'SKU',
  leitor: 'Leitor',
  'qr-code': 'QR Code',
  geral: 'Geral',
}

export const CATEGORIA_COLOR: Record<string, string> = {
  pix: 'bg-emerald-100 text-emerald-700',
  'codigo-barras': 'bg-indigo-100 text-indigo-700',
  ean: 'bg-violet-100 text-violet-700',
  sku: 'bg-amber-100 text-amber-700',
  leitor: 'bg-sky-100 text-sky-700',
  'qr-code': 'bg-blue-100 text-blue-700',
  geral: 'bg-gray-100 text-gray-700',
}

export const CATEGORIA_BORDER: Record<string, string> = {
  pix: 'border-l-emerald-400',
  'codigo-barras': 'border-l-indigo-400',
  ean: 'border-l-violet-400',
  sku: 'border-l-amber-400',
  leitor: 'border-l-sky-400',
  'qr-code': 'border-l-blue-400',
  geral: 'border-l-gray-300',
}

export const CATEGORIA_GRADIENT: Record<string, string> = {
  pix: 'from-emerald-500 to-teal-400',
  'codigo-barras': 'from-indigo-500 to-blue-400',
  ean: 'from-violet-500 to-purple-400',
  sku: 'from-amber-500 to-orange-400',
  leitor: 'from-sky-500 to-cyan-400',
  'qr-code': 'from-blue-500 to-indigo-400',
  geral: 'from-gray-400 to-gray-500',
}

function CategoriaIcon({ categoria }: { categoria?: string }) {
  const cls = 'w-12 h-12 text-white/40'
  switch (categoria) {
    case 'pix':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M13 3 4 14h8l-2 8L20 10h-8l1-7z"/>
        </svg>
      )
    case 'codigo-barras':
    case 'ean':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <rect x="2" y="5" width="2" height="14"/>
          <rect x="5" y="5" width="1" height="14"/>
          <rect x="7" y="5" width="3" height="14"/>
          <rect x="11" y="5" width="1" height="14"/>
          <rect x="13" y="5" width="2" height="14"/>
          <rect x="17" y="5" width="1" height="14"/>
          <rect x="19" y="5" width="3" height="14"/>
        </svg>
      )
    case 'sku':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9A2 2 0 0 0 13 22a2 2 0 0 0 1.41-.59l7-7A2 2 0 0 0 22 13a2 2 0 0 0-.59-1.42zM5.5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
        </svg>
      )
    case 'leitor':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M9 2 7.17 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
        </svg>
      )
    case 'qr-code':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM18 13h-2v2h2v-2zm-4 0h2v2h-2v-2zm2 2h-2v2h2v-2zm-2 2h2v2h-2v-2zm2 2h2v-2h-2v2zm2-4h2v2h-2v-2zm0 4h2v-2h-2v2zm2-6v2h-2v-2h2z"/>
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
      )
  }
}

function isUpdated(pub: string, upd?: string): boolean {
  if (!upd || upd === pub) return false
  return upd > pub
}

function PostCard({ post }: { post: BlogIndexEntry }) {
  const showUpdated = isUpdated(post.dataPublicacaoIso, post.dataAtualizacaoIso)
  const borderColor = CATEGORIA_BORDER[post.categoria ?? ''] ?? 'border-l-gray-300'
  const gradient = CATEGORIA_GRADIENT[post.categoria ?? ''] ?? 'from-gray-400 to-gray-500'
  const updatedLabel = showUpdated ? formatDateMonthYear(post.dataAtualizacaoIso) : null

  return (
    <article
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} overflow-hidden transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col`}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.h1 || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <CategoriaIcon categoria={post.categoria} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Meta: categoria (pill colorida) + tempo (texto cinza) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
            {post.categoria && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORIA_COLOR[post.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
                {CATEGORIA_LABEL[post.categoria] ?? post.categoria}
              </span>
            )}
            {post.tempoLeitura && (
              <span className="text-xs text-gray-400">· {post.tempoLeitura} min</span>
            )}
            {updatedLabel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200">
                ↻ Atualizado em {updatedLabel}
              </span>
            )}
          </div>

          <h2 className="text-base font-semibold text-gray-900 mb-2 leading-snug line-clamp-2">
            {post.h1 || post.title}
          </h2>

          {(post.resumo || post.subtitle) && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
              {post.resumo || post.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-500">{post.autor || 'Amanda Budri'}</span>
            <time dateTime={post.dataPublicacaoIso}>{post.dataPublicacaoHumana}</time>
          </div>

          {post.ferramentaRelacionadaSlug && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-indigo-600 font-medium line-clamp-1">
              🔧 {post.ferramentaRelacionadaTitulo || post.ferramentaRelacionadaSlug} →
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

export default function BlogIndex({ posts, query, page = 1, onPageChange }: BlogIndexProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
        {query?.trim() ? (
          <>
            <p className="text-base font-medium text-gray-700">Nenhum post encontrado para &ldquo;{query.trim()}&rdquo;</p>
            <p className="mt-1 text-sm text-gray-500">Tente outros termos: pix, ean, código de barras, sku&hellip;</p>
          </>
        ) : (
          <p className="text-gray-600">Nenhum post publicado nesta categoria ainda.</p>
        )}
      </div>
    )
  }

  const showPagination = !query?.trim() && posts.length > POSTS_PER_PAGE
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const visible = showPagination ? posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE) : posts

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visible.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-10" aria-label="Paginação do blog">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-700'
              }`}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
