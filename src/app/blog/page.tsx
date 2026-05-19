import { existsSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import BlogSearchClient from '@/components/BlogSearchClient'
import { type BlogIndexEntry, CATEGORIA_COLOR, CATEGORIA_LABEL } from '@/components/BlogIndex'
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
    allTools.map((t) => [t.slug, t.entry.h1 || t.entry.title])
  )

  const posts: BlogIndexEntry[] = allPosts
    .filter((p) => p.slug !== '_template')
    .map((p) => ({
      slug: p.slug,
      title: p.entry.title,
      h1: p.entry.h1,
      resumo: p.entry.resumo,
      subtitle: p.entry.subtitle,
      categoria: p.entry.categoria,
      persona: p.entry.persona,
      dataPublicacaoIso: p.entry.dataPublicacao,
      dataPublicacaoHumana: formatDateHuman(p.entry.dataPublicacao),
      dataAtualizacaoIso: p.entry.dataAtualizacao ?? undefined,
      dataAtualizacaoHumana: formatDateHuman(p.entry.dataAtualizacao),
      tempoLeitura: p.entry.tempoLeitura ?? undefined,
      ferramentaRelacionadaSlug: p.entry.ferramentaRelacionadaSlug ?? undefined,
      ferramentaRelacionadaTitulo: p.entry.ferramentaRelacionadaSlug
        ? toolTitleMap.get(p.entry.ferramentaRelacionadaSlug) ?? undefined
        : undefined,
      featured: (p.entry as { featured?: boolean }).featured ?? false,
      autor: p.entry.autor ?? undefined,
      heroImage: existsSync(join(process.cwd(), 'public', 'blog', p.slug, 'hero.webp'))
        ? `/blog/${p.slug}/hero.webp`
        : undefined,
    }))
    .sort((a, b) => (a.dataPublicacaoIso < b.dataPublicacaoIso ? 1 : -1))

  // Featured post: explicit featured flag, or fall back to most recent
  const featuredPost = posts.find((p) => p.featured) ?? posts[0]

  // "Comece por aqui": top 4 posts by tempoLeitura (pillar posts)
  const pilarPosts = [...posts]
    .sort((a, b) => (b.tempoLeitura ?? 0) - (a.tempoLeitura ?? 0))
    .slice(0, 4)

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
            <div className="relative sm:w-1/2 aspect-video sm:aspect-auto overflow-hidden bg-gray-100">
              {featuredPost.heroImage ? (
                <Image
                  src={featuredPost.heroImage}
                  alt={featuredPost.h1 || featuredPost.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-400" />
              )}
            </div>
            <div className="p-6 sm:w-1/2 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3">
                Destaque
              </span>
              <div className="flex flex-wrap gap-2 mb-3">
                {featuredPost.categoria && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORIA_COLOR[featuredPost.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
                    {CATEGORIA_LABEL[featuredPost.categoria] ?? featuredPost.categoria}
                  </span>
                )}
                {featuredPost.tempoLeitura && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    {featuredPost.tempoLeitura} min
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {featuredPost.h1 || featuredPost.title}
              </h2>
              {featuredPost.resumo && (
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{featuredPost.resumo}</p>
              )}
              <span className="text-sm text-indigo-600 font-medium group-hover:underline">
                Ler artigo →
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* "Comece por aqui" — top pillar posts */}
      {pilarPosts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comece por aqui</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pilarPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {post.heroImage ? (
                    <Image
                      src={post.heroImage}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-400" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-semibold leading-snug line-clamp-2 drop-shadow">
                    {post.h1 || post.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tools CTA */}
      <div className="mb-10 bg-indigo-50 rounded-2xl p-5 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Precisa gerar agora?</span>
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="text-sm bg-white border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
          >
            {t.label}
          </Link>
        ))}
      </div>

      <BlogSearchClient posts={posts} initialQuery={initialQuery} />

      <div className="flex justify-center mt-12">
        <AdSlot slot="blog-index-bottom" format="responsive" />
      </div>
    </div>
  )
}
