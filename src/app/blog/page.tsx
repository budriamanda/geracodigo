import { existsSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import BlogSearchClient from '@/components/BlogSearchClient'
import { type BlogIndexEntry, CATEGORIA_COLOR, CATEGORIA_GRADIENT, CATEGORIA_LABEL } from '@/components/BlogIndex'
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
            {/* Imagem / placeholder lado esquerdo */}
            <div className="relative sm:w-[45%] aspect-video sm:aspect-auto overflow-hidden bg-gray-100 min-h-[180px]">
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
                <div className={`w-full h-full bg-gradient-to-br ${CATEGORIA_GRADIENT[featuredPost.categoria ?? ''] ?? 'from-indigo-500 to-blue-400'} flex flex-col items-center justify-center gap-4 p-6`}>
                  {/* Ícone grande da categoria */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-white/30" aria-hidden="true">
                    {featuredPost.categoria === 'leitor' && <path d="M9 2 7.17 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>}
                    {featuredPost.categoria === 'pix' && <path d="M13 3 4 14h8l-2 8L20 10h-8l1-7z"/>}
                    {(featuredPost.categoria === 'codigo-barras' || featuredPost.categoria === 'ean') && <><rect x="2" y="5" width="2" height="14"/><rect x="5" y="5" width="1" height="14"/><rect x="7" y="5" width="3" height="14"/><rect x="11" y="5" width="1" height="14"/><rect x="13" y="5" width="2" height="14"/><rect x="17" y="5" width="1" height="14"/><rect x="19" y="5" width="3" height="14"/></>}
                    {featuredPost.categoria === 'sku' && <path d="M21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9A2 2 0 0 0 13 22a2 2 0 0 0 1.41-.59l7-7A2 2 0 0 0 22 13a2 2 0 0 0-.59-1.42zM5.5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>}
                    {featuredPost.categoria === 'qr-code' && <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM18 13h-2v2h2v-2zm-4 0h2v2h-2v-2zm2 2h-2v2h2v-2zm-2 2h2v2h-2v-2zm2 2h2v-2h-2v2zm2-4h2v2h-2v-2zm0 4h2v-2h-2v2zm2-6v2h-2v-2h2z"/>}
                    {(!featuredPost.categoria || featuredPost.categoria === 'geral') && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>}
                  </svg>
                  {/* Título sobreposto no gradiente */}
                  <p className="text-white/80 text-center text-sm font-medium leading-snug line-clamp-3 px-2">
                    {featuredPost.h1 || featuredPost.title}
                  </p>
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORIA_COLOR[featuredPost.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
                    {CATEGORIA_LABEL[featuredPost.categoria] ?? featuredPost.categoria}
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

      {/* "Comece por aqui" — top pillar posts */}
      {pilarPosts.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comece por aqui</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pilarPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col"
              >
                {/* Imagem no topo */}
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
                    <div className={`w-full h-full bg-gradient-to-br ${CATEGORIA_GRADIENT[post.categoria ?? ''] ?? 'from-indigo-500 to-blue-400'} flex items-center justify-center`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/40" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                      </svg>
                    </div>
                  )}
                </div>
                {/* Texto embaixo em fundo branco */}
                <div className="p-3 flex flex-col gap-1">
                  {post.categoria && (
                    <span className={`self-start inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORIA_COLOR[post.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
                      {CATEGORIA_LABEL[post.categoria] ?? post.categoria}
                    </span>
                  )}
                  <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
                    {post.h1 || post.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tools CTA — visualmente separado dos filtros de categoria abaixo */}
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
