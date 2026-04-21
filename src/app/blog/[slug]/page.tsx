import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostLayout from '@/components/BlogPostLayout'
import SchemaMarkup from '@/components/SchemaMarkup'
import { reader } from '@/lib/content'
import { formatDateHuman, isoOrFallback } from '@/lib/dates'
import { LAST_UPDATED_ISO } from '@/lib/constants'

const BASE = 'https://www.geracodigo.com.br'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await reader.collections.posts.all()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await reader.collections.posts.read(slug)
  if (!post) return {}
  const url = `${BASE}/blog/${slug}`
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: post.ogTitle || post.title,
      description: post.ogDescription || post.metaDescription,
      url,
      type: 'article',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      publishedTime: isoOrFallback(post.dataPublicacao, LAST_UPDATED_ISO),
      modifiedTime: isoOrFallback(post.dataAtualizacao, LAST_UPDATED_ISO),
      authors: [post.autor || 'Equipe GeraCode'],
      images: [{ url: `/blog/${slug}/opengraph-image`, width: 1200, height: 630, alt: post.ogTitle || post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.twitterTitle || post.ogTitle || post.title,
      description: post.twitterDescription || post.ogDescription || post.metaDescription,
      images: [`/blog/${slug}/opengraph-image`],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await reader.collections.posts.read(slug)
  if (!post) notFound()

  const [allFaqs, allTools] = await Promise.all([
    reader.collections.faqs.all(),
    reader.collections.ferramentas.all(),
  ])

  // FAQs relacionadas: vêm por slug explícito em post.faqsSlugs
  const faqsSlugs = (post.faqsSlugs || []) as string[]
  const faqs = faqsSlugs
    .map((s) => allFaqs.find((f) => f.slug === s))
    .filter((f): f is (typeof allFaqs)[number] => Boolean(f))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  const ferramenta = post.ferramentaRelacionadaSlug
    ? allTools.find((t) => t.slug === post.ferramentaRelacionadaSlug)
    : undefined

  const ferramentaRef = ferramenta
    ? {
        slug: ferramenta.slug,
        title: ferramenta.entry.title,
        h1: ferramenta.entry.h1,
        cardDescription: ferramenta.entry.cardDescription,
      }
    : undefined

  const pubIso = isoOrFallback(post.dataPublicacao, LAST_UPDATED_ISO)
  const updIso = isoOrFallback(post.dataAtualizacao, pubIso)
  const url = `${BASE}/blog/${slug}`

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.h1 || post.title,
      description: post.metaDescription,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      datePublished: pubIso,
      dateModified: updIso,
      inLanguage: 'pt-BR',
      author: isOrgAuthor(post.autor)
        ? { '@id': `${BASE}/#organization` }
        : { '@type': 'Person', name: post.autor || 'Equipe GeraCode' },
      publisher: { '@id': `${BASE}/#organization` },
      image: [`${BASE}/blog/${slug}/opengraph-image`],
      keywords: [post.keywordPrimaria, ...((post.keywordsSecundarias || []) as string[])].filter(Boolean).join(', '),
      articleSection: post.categoria,
      wordCount: countWords(post.bodyMarkdown),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: post.h1 || post.title, item: url },
      ],
    },
  ]

  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  return (
    <>
      <SchemaMarkup schema={schemas} />
      <BlogPostLayout
        slug={slug}
        title={post.title}
        h1={post.h1 || post.title}
        subtitle={post.subtitle}
        resumo={post.resumo}
        autor={post.autor || 'Equipe GeraCode'}
        dataPublicacaoIso={pubIso}
        dataPublicacaoHumana={formatDateHuman(pubIso)}
        dataAtualizacaoIso={updIso}
        dataAtualizacaoHumana={formatDateHuman(updIso)}
        tempoLeitura={post.tempoLeitura ?? undefined}
        categoria={post.categoria}
        tags={(post.tags || []) as string[]}
        bodyMarkdown={post.bodyMarkdown || ''}
        ferramentaRelacionada={ferramentaRef}
        faqs={faqs}
      />
    </>
  )
}

function isOrgAuthor(autor: string | undefined | null): boolean {
  if (!autor) return true
  const lower = autor.toLowerCase()
  return lower.includes('equipe') || lower.includes('geracode')
}

function countWords(text: string | undefined | null): number {
  if (!text) return 0
  return text.trim().split(/\s+/).length
}
