import Image from 'next/image'
import Link from 'next/link'

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

function isUpdated(pub: string, upd?: string): boolean {
  if (!upd || upd === pub) return false
  return upd > pub
}

const CATEGORIA_GRADIENT: Record<string, string> = {
  pix: 'from-emerald-500 to-teal-400',
  'codigo-barras': 'from-indigo-500 to-blue-400',
  ean: 'from-violet-500 to-purple-400',
  sku: 'from-amber-500 to-orange-400',
  leitor: 'from-sky-500 to-cyan-400',
  'qr-code': 'from-blue-500 to-indigo-400',
  geral: 'from-gray-500 to-gray-400',
}

function PostCard({ post }: { post: BlogIndexEntry }) {
  const showUpdated = isUpdated(post.dataPublicacaoIso, post.dataAtualizacaoIso)
  const borderColor = CATEGORIA_BORDER[post.categoria ?? ''] ?? 'border-l-gray-300'
  const gradient = CATEGORIA_GRADIENT[post.categoria ?? ''] ?? 'from-gray-500 to-gray-400'

  return (
    <article
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderColor} overflow-hidden transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col`}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
      >
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
              <span className="text-white/30 text-5xl font-bold select-none">
                {(post.categoria ?? 'G').slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            {post.categoria && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${CATEGORIA_COLOR[post.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
                {CATEGORIA_LABEL[post.categoria] ?? post.categoria}
              </span>
            )}
            {post.tempoLeitura && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {post.tempoLeitura} min
              </span>
            )}
            {showUpdated && post.dataAtualizacaoHumana && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                Atualizado
              </span>
            )}
          </div>

          <h2 className="text-base font-semibold text-gray-900 mb-2 leading-snug line-clamp-2">
            {post.h1 || post.title}
          </h2>

          {(post.resumo || post.subtitle) && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
              {post.resumo || post.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-500">{post.autor || 'Amanda Budri'}</span>
            <time dateTime={post.dataPublicacaoIso}>{post.dataPublicacaoHumana}</time>
          </div>

          {post.ferramentaRelacionadaSlug && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-indigo-600 font-medium">
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
