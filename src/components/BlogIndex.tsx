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
  tempoLeitura?: number
}

interface BlogIndexProps {
  posts: BlogIndexEntry[]
  query?: string
}

const CATEGORIA_LABEL: Record<string, string> = {
  pix: 'QR Code Pix',
  'codigo-barras': 'Código de Barras',
  ean: 'EAN',
  sku: 'SKU',
  leitor: 'Leitor',
  'qr-code': 'QR Code',
  geral: 'Geral',
}

export default function BlogIndex({ posts, query }: BlogIndexProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
        {query?.trim() ? (
          <>
            <p className="text-base font-medium text-gray-700">Nenhum post encontrado para &ldquo;{query.trim()}&rdquo;</p>
            <p className="mt-1 text-sm text-gray-500">Tente outros termos: pix, ean, código de barras, sku&hellip;</p>
          </>
        ) : (
          <p className="text-gray-600">
            Nenhum post publicado ainda. Em breve traremos conteúdo para lojistas, MEIs e restaurantes.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Link
            href={`/blog/${post.slug}`}
            className="block p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl h-full"
          >
            <div className="flex flex-wrap gap-2 text-xs mb-3">
              {post.categoria && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                  {CATEGORIA_LABEL[post.categoria] ?? post.categoria}
                </span>
              )}
              {post.tempoLeitura && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {post.tempoLeitura} min
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">{post.h1 || post.title}</h2>
            {(post.resumo || post.subtitle) && (
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{post.resumo || post.subtitle}</p>
            )}
            <p className="text-xs text-gray-400">
              <time dateTime={post.dataPublicacaoIso}>{post.dataPublicacaoHumana}</time>
            </p>
          </Link>
        </article>
      ))}
    </div>
  )
}
