import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import BlogSearchClient from '@/components/BlogSearchClient'
import { type BlogIndexEntry, CATEGORIA_CONFIG } from '@/components/BlogIndex'
import CategoryIcon from '@/components/CategoryIcon'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaMarkup from '@/components/SchemaMarkup'
import { reader } from '@/lib/content'
import { formatDateHuman } from '@/lib/dates'

const BASE = 'https://www.geracodigo.com.br'

export const metadata: Metadata = {
  title: 'Blog: guias de QR Code Pix, código de barras e SKU',
  description: 'Guias práticos, tutoriais e dicas para lojistas, MEIs e restaurantes que usam QR Code Pix, código de barras, EAN e SKU no dia a dia.',
  alternates: { canonical: `${BASE}/blog` },
  openGraph: {
    title: 'Blog do GeraCode',
    description: 'Guias práticos para MEIs, lojistas e restaurantes: QR Code Pix, código de barras, EAN, SKU.',
    url: `${BASE}/blog`,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'GeraCode',
    images: [{ url: '/blog/opengraph-image', width: 1200, height: 630, alt: 'Blog do GeraCode' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog do GeraCode',
    description: 'Guias práticos de Pix, código de barras e SKU para lojistas brasileiros.',
    images: ['/blog/opengraph-image'],
  },
}

const TOOLS = [
  { href: '/gerador-de-qr-code-pix', label: 'QR Code Pix' },
  { href: '/gerador-de-qr-code', label: 'QR Code' },
  { href: '/gerador-de-codigo-de-barras', label: 'Código de Barras' },
  { href: '/gerador-de-ean', label: 'EAN-13' },
  { href: '/gerador-de-sku', label: 'SKU' },
  { href: '/leitor-de-codigo-de-barras', label: 'Leitor' },
]

const PILAR_SLUGS = [
  'qr-code-pix-para-mei-guia-completo',
  'code-128-itf-14-guia-logistica-estoque',
  'ean-13-ean-8-guia-completo',
  'codigo-de-barras-para-produtos-guia-completo',
]

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const initialQuery = typeof q === 'string' ? q.slice(0, 100) : ''

  const [allPosts, allTools] = await Promise.all([
    reader.collections.posts.all(),
    reader.collections.ferramentas.all(),
  ])

  const toolTitleMap = new Map(
    allTools.map((t) => [t.slug, t.entry.title])
  )

  const posts: BlogIndexEntry[] = allPosts
    .filter((p) => p.slug !== '_template')
    .map((p) => {
      const ferramentaSlug = p.entry.ferramentaRelacionadaSlug ?? undefined
      const ferramentaTitle = ferramentaSlug ? toolTitleMap.get(ferramentaSlug) : undefined

      return {
        slug: p.slug,
        title: p.entry.title,
        h1: p.entry.h1,
        resumo: p.entry.resumo,
        subtitle: p.entry.subtitle,
        categoria: p.entry.categoria,
        persona: p.entry.persona,
        autor: p.entry.autor ?? undefined,
        dataPublicacaoIso: p.entry.dataPublicacao,
        dataPublicacaoHumana: formatDateHuman(p.entry.dataPublicacao),
        dataAtualizacaoIso: p.entry.dataAtualizacao ?? undefined,
        dataAtualizacaoHumana: formatDateHuman(p.entry.dataAtualizacao),
        tempoLeitura: p.entry.tempoLeitura ?? undefined,
        ferramentaRelacionada: ferramentaSlug && ferramentaTitle
          ? { slug: ferramentaSlug, title: ferramentaTitle }
          : undefined,
        isPilar: PILAR_SLUGS.includes(p.slug),
        featured: (p.entry as { featured?: boolean }).featured ?? false,
      }
    })
    .sort((a, b) => (a.dataPublicacaoIso < b.dataPublicacaoIso ? 1 : -1))

  // Featured post: explicit featured flag, or fall back to most recent
  const featuredPost = posts.find((p) => p.featured) ?? posts[0]

  // "Comece por aqui": posts pilares na ordem de PILAR_SLUGS
  const pilarPosts = PILAR_SLUGS
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((p): p is BlogIndexEntry => p !== undefined)

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog do GeraCode',
      description: 'Guias práticos, tutoriais e dicas para lojistas, MEIs e restaurantes brasileiros.',
      url: `${BASE}/blog`,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${BASE}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
      ],
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <Breadcrumb current="Blog" />

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Blog — Guias de QR Code, Pix, Código de Barras e SKU
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Guias práticos para lojistas, MEIs e restaurantes brasileiros — sem enrolação.
        </p>
      </header>

      {/* Featured post hero */}
      {featuredPost && (
        <div className="mb-10 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group">
          <Link href={`/blog/${featuredPost.slug}`} className="sm:flex block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-2xl">
            {/* Imagem / placeholder lado esquerdo */}
            <div className="relative sm:w-[45%] aspect-video sm:aspect-auto overflow-hidden min-h-[180px]">
              {featuredPost.heroImage ? (
                <Image
                  src={featuredPost.heroImage}
                  alt={featuredPost.h1 || featuredPost.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 45vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  priority
                />
              ) : (
                <div className={`w-full h-full ${CATEGORIA_CONFIG[featuredPost.categoria ?? 'geral']?.bg ?? 'bg-indigo-600'} flex flex-col items-center justify-center gap-4 p-6`}>
                  <CategoryIcon
                    categoria={featuredPost.categoria ?? 'geral'}
                    size={80}
                    color={CATEGORIA_CONFIG[featuredPost.categoria ?? 'geral']?.iconColor ?? '#fff'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none" />
                </div>
              )}
              {/* Badge destaque sobreposto no canto */}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                ★ Destaque
              </span>
            </div>

            {/* Conteúdo lado direito */}
            <div className="p-6 sm:w-[55%] flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
                {featuredPost.categoria && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORIA_CONFIG[featuredPost.categoria]?.pill ?? 'bg-gray-100 text-gray-700'}`}>
                    {CATEGORIA_CONFIG[featuredPost.categoria]?.label ?? featuredPost.categoria}
                  </span>
                )}
                {featuredPost.tempoLeitura && (
                  <span className="text-xs text-gray-400">· {featuredPost.tempoLeitura} min</span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {featuredPost.h1 || featuredPost.title}
              </h2>
              {featuredPost.resumo && (
                <p className="text-gray-500 mb-4 line-clamp-3 text-sm leading-relaxed">{featuredPost.resumo}</p>
              )}
              <span className="inline-flex items-center gap-1 text-sm text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                Ler artigo <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* "Comece por aqui" — posts pilares */}
      {pilarPosts.length > 0 && (
        <section aria-labelledby="comece-por-aqui" className="mb-10">
          <h2 id="comece-por-aqui" className="text-lg font-semibold text-gray-900 mb-4">Comece por aqui</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pilarPosts.map((post) => {
              const config = CATEGORIA_CONFIG[post.categoria ?? 'geral'] ?? CATEGORIA_CONFIG.geral
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  {/* Thumbnail */}
                  <div className={`relative flex items-center justify-center h-28 ${config.bg}`} aria-hidden="true">
                    <CategoryIcon categoria={post.categoria ?? 'geral'} size={56} color={config.iconColor} />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                  </div>

                  {/* Texto */}
                  <div className="flex flex-col flex-1 p-4">
                    <span className={`self-start text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${config.pill}`}>
                      {config.label}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-3 group-hover:text-indigo-600 transition-colors leading-snug">
                      {post.h1 || post.title}
                    </h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Tools CTA */}
      <div className="mb-10 bg-indigo-600 rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-white font-semibold whitespace-nowrap flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-300" aria-hidden="true">
              <path d="M13 3 4 14h8l-2 8L20 10h-8l1-7z"/>
            </svg>
            Precisa gerar agora?
          </span>
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="text-sm bg-white text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors font-semibold shadow-sm"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <BlogSearchClient posts={posts} initialQuery={initialQuery} />

      <div className="flex justify-center mt-12">
        <AdSlot slot="blog-index-bottom" format="responsive" />
      </div>
    </div>
  )
}
