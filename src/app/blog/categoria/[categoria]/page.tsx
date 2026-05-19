import { existsSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AdSlot from '@/components/AdSlot'
import BlogSearchClient from '@/components/BlogSearchClient'
import { type BlogIndexEntry } from '@/components/BlogIndex'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaMarkup from '@/components/SchemaMarkup'
import { reader } from '@/lib/content'
import { formatDateHuman } from '@/lib/dates'

const BASE = 'https://www.geracodigo.com.br'

const CATEGORIA_META: Record<string, { label: string; description: string }> = {
  pix: {
    label: 'QR Code Pix',
    description: 'Guias práticos sobre QR Code Pix para MEIs, lojistas e restaurantes — como gerar, cobrar e receber pagamentos via Pix.',
  },
  'codigo-barras': {
    label: 'Código de Barras',
    description: 'Tudo sobre código de barras: EAN-13, Code 128, Code 39, como gerar e imprimir para seus produtos.',
  },
  ean: {
    label: 'EAN',
    description: 'Guias sobre EAN-13 e EAN-8 — o padrão internacional de código de barras para produtos de varejo.',
  },
  sku: {
    label: 'SKU',
    description: 'Como criar e gerenciar SKUs para controle de estoque eficiente no seu negócio.',
  },
  leitor: {
    label: 'Leitor de Código',
    description: 'Como usar leitores de QR Code e código de barras pelo computador, celular e outros dispositivos.',
  },
  'qr-code': {
    label: 'QR Code',
    description: 'Guias completos sobre QR Code: como criar, personalizar e usar em diferentes situações do dia a dia.',
  },
  geral: {
    label: 'Geral',
    description: 'Artigos gerais sobre ferramentas de QR Code, código de barras e gestão para pequenos negócios.',
  },
}

const VALID_CATEGORIAS = Object.keys(CATEGORIA_META)

interface PageProps {
  params: Promise<{ categoria: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateStaticParams() {
  return VALID_CATEGORIAS.map((categoria) => ({ categoria }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params
  const meta = CATEGORIA_META[categoria]
  if (!meta) return {}

  return {
    title: `${meta.label}: guias e tutoriais | Blog GeraCode`,
    description: meta.description,
    alternates: { canonical: `${BASE}/blog/categoria/${categoria}` },
    openGraph: {
      title: `${meta.label} — Blog GeraCode`,
      description: meta.description,
      url: `${BASE}/blog/categoria/${categoria}`,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
    },
  }
}

export default async function BlogCategoriaPage({ params, searchParams }: PageProps) {
  const { categoria } = await params
  const { q } = await searchParams
  const initialQuery = typeof q === 'string' ? q.slice(0, 100) : ''

  if (!VALID_CATEGORIAS.includes(categoria)) notFound()

  const meta = CATEGORIA_META[categoria]!

  const [allPosts, allTools] = await Promise.all([
    reader.collections.posts.all(),
    reader.collections.ferramentas.all(),
  ])

  const toolTitleMap = new Map(
    allTools.map((t) => [t.slug, t.entry.h1 || t.entry.title])
  )

  const posts: BlogIndexEntry[] = allPosts
    .filter((p) => p.slug !== '_template' && p.entry.categoria === categoria)
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
      autor: p.entry.autor ?? undefined,
      heroImage: existsSync(join(process.cwd(), 'public', 'blog', p.slug, 'hero.webp'))
        ? `/blog/${p.slug}/hero.webp`
        : undefined,
    }))
    .sort((a, b) => (a.dataPublicacaoIso < b.dataPublicacaoIso ? 1 : -1))

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${meta.label} — Blog GeraCode`,
      description: meta.description,
      url: `${BASE}/blog/categoria/${categoria}`,
      inLanguage: 'pt-BR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: meta.label, item: `${BASE}/blog/categoria/${categoria}` },
      ],
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <Breadcrumb
        current={meta.label}
        trail={[{ label: 'Blog', href: '/blog' }]}
      />

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          {meta.label}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">{meta.description}</p>
        {posts.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">
            {posts.length} artigo{posts.length !== 1 ? 's' : ''} publicado{posts.length !== 1 ? 's' : ''}
          </p>
        )}
      </header>

      <BlogSearchClient posts={posts} initialQuery={initialQuery} activeCategory={categoria} />

      <div className="flex justify-center mt-12">
        <AdSlot slot="blog-categoria-bottom" format="responsive" />
      </div>
    </div>
  )
}
