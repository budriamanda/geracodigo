import type { Metadata } from 'next'
import AdSlot from '@/components/AdSlot'
import BlogSearchClient from '@/components/BlogSearchClient'
import { type BlogIndexEntry } from '@/components/BlogIndex'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaMarkup from '@/components/SchemaMarkup'
import { reader } from '@/lib/content'
import { formatDateHuman } from '@/lib/dates'

const BASE = 'https://www.geracodigo.com.br'

export const metadata: Metadata = {
  title: 'Blog | GeraCode — Guias de QR Code Pix, Código de Barras, EAN e SKU',
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

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const initialQuery = typeof q === 'string' ? q.slice(0, 100) : ''

  const allPosts = await reader.collections.posts.all()
  const posts: BlogIndexEntry[] = allPosts
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
      tempoLeitura: p.entry.tempoLeitura ?? undefined,
    }))
    .sort((a, b) => (a.dataPublicacaoIso < b.dataPublicacaoIso ? 1 : -1))

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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Blog do GeraCode</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Guias práticos para lojistas, MEIs e restaurantes brasileiros. QR Code Pix, código de barras, EAN, SKU — sem enrolação.
        </p>
      </header>

      <BlogSearchClient posts={posts} initialQuery={initialQuery} />

      <div className="flex justify-center mt-12">
        <AdSlot slot="blog-index-bottom" format="responsive" />
      </div>
    </div>
  )
}
