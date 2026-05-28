import Link from 'next/link'
import CategoryIcon from './CategoryIcon'

export interface BlogIndexEntry {
  slug: string
  title: string
  h1: string
  resumo?: string
  subtitle?: string
  categoria?: string
  persona?: string
  autor?: string
  dataPublicacaoHumana: string
  dataPublicacaoIso: string
  dataAtualizacaoHumana?: string
  dataAtualizacaoIso?: string
  tempoLeitura?: number
  ferramentaRelacionada?: {
    slug: string
    title: string
  }
  isPilar?: boolean
  featured?: boolean
  heroImage?: string
}

interface BlogIndexProps {
  posts: BlogIndexEntry[]
  query?: string
  page?: number
  onPageChange?: (page: number) => void
}

const POSTS_PER_PAGE = 12

export const CATEGORIA_CONFIG: Record<string, {
  label: string
  pill: string
  bg: string
  iconColor: string
  linkAccent: string
}> = {
  pix: {
    label: 'QR Code Pix',
    pill: 'bg-emerald-100 text-emerald-700',
    bg: 'bg-emerald-500',
    iconColor: '#fff',
    linkAccent: 'text-emerald-600 hover:text-emerald-800',
  },
  'codigo-barras': {
    label: 'Código de Barras',
    pill: 'bg-indigo-100 text-indigo-700',
    bg: 'bg-indigo-600',
    iconColor: '#fff',
    linkAccent: 'text-indigo-600 hover:text-indigo-800',
  },
  ean: {
    label: 'EAN',
    pill: 'bg-violet-100 text-violet-700',
    bg: 'bg-violet-600',
    iconColor: '#fff',
    linkAccent: 'text-violet-600 hover:text-violet-800',
  },
  sku: {
    label: 'SKU',
    pill: 'bg-amber-100 text-amber-700',
    bg: 'bg-amber-500',
    iconColor: '#fff',
    linkAccent: 'text-amber-600 hover:text-amber-800',
  },
  leitor: {
    label: 'Leitor',
    pill: 'bg-sky-100 text-sky-700',
    bg: 'bg-sky-600',
    iconColor: '#fff',
    linkAccent: 'text-sky-600 hover:text-sky-800',
  },
  'qr-code': {
    label: 'QR Code',
    pill: 'bg-blue-100 text-blue-700',
    bg: 'bg-blue-600',
    iconColor: '#fff',
    linkAccent: 'text-blue-600 hover:text-blue-800',
  },
  geral: {
    label: 'Geral',
    pill: 'bg-gray-100 text-gray-600',
    bg: 'bg-gray-500',
    iconColor: '#fff',
    linkAccent: 'text-gray-600 hover:text-gray-800',
  },
}

const CATEGORIA_BORDER: Record<string, string> = {
  pix: 'border-l-emerald-400',
  'codigo-barras': 'border-l-indigo-400',
  ean: 'border-l-violet-400',
  sku: 'border-l-amber-400',
  leitor: 'border-l-sky-400',
  'qr-code': 'border-l-blue-400',
  geral: 'border-l-gray-300',
}

function truncateResumo(text: string, maxChars = 120): string {
  if (!text || text.length <= maxChars) return text
  const truncated = text.slice(0, maxChars)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 90 ? truncated.slice(0, lastSpace) : truncated) + '…'
}

function isUpdated(pub: string, upd?: string): boolean {
  if (!upd || upd === pub) return false
  return upd > pub
}

function PostCard({ post }: { post: BlogIndexEntry }) {
  const config = CATEGORIA_CONFIG[post.categoria ?? 'geral'] ?? CATEGORIA_CONFIG.geral
  const borderColor = CATEGORIA_BORDER[post.categoria ?? 'geral'] ?? 'border-l-gray-300'
  const showUpdated = isUpdated(post.dataPublicacaoIso, post.dataAtualizacaoIso)

  return (
    <article
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} overflow-hidden transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col`}
    >
      {/* Thumbnail + conteúdo principal: link para o post */}
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-t-xl"
      >
        {/* Thumbnail */}
        <div
          className={`relative flex items-center justify-center h-28 sm:h-36 ${config.bg}`}
          aria-hidden="true"
        >
          <CategoryIcon categoria={post.categoria ?? 'geral'} size={80} color={config.iconColor} />
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none" />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Categoria + tempo */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
            {post.categoria && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.pill}`}>
                {config.label}
              </span>
            )}
            {post.tempoLeitura && (
              <span className="text-xs text-gray-400">· {post.tempoLeitura} min</span>
            )}
          </div>

          <h3 className="text-base font-semibold text-gray-900 mb-2 leading-snug line-clamp-2">
            {post.h1 || post.title}
          </h3>

          {(post.resumo || post.subtitle) && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {truncateResumo(post.resumo ?? post.subtitle ?? '')}
            </p>
          )}

          {/* Rodapé: autor · data · atualizado */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-500">{post.autor || 'Amanda Budri'}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.dataPublicacaoIso}>{post.dataPublicacaoHumana}</time>

            {showUpdated && post.dataAtualizacaoHumana && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                    <path d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm.5 2.5v3.25l2.5 1.5-.5.866L5.5 7.25V3.5h1z"/>
                  </svg>
                  Atualizado em {post.dataAtualizacaoHumana}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Link de ferramenta relacionada: fora do link do post para evitar <a> aninhado */}
      {post.ferramentaRelacionada && (
        <div className="px-5 pb-4 pt-0">
          <Link
            href={`/${post.ferramentaRelacionada.slug}`}
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.linkAccent}`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 7h10M7 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {post.ferramentaRelacionada.title}
          </Link>
        </div>
      )}
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
