import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LandingVerticalLayout from '@/components/LandingVerticalLayout'
import SchemaMarkup from '@/components/SchemaMarkup'
import { reader } from '@/lib/content'
import { formatDateHuman, isoOrFallback } from '@/lib/dates'
import { LAST_UPDATED_ISO } from '@/lib/constants'

const BASE = 'https://www.geracodigo.com.br'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const landings = await reader.collections.landingsVerticais.all()
  return landings.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const landing = await reader.collections.landingsVerticais.read(slug)
  if (!landing) return {}
  const url = `${BASE}/solucoes/${slug}`
  return {
    title: landing.title,
    description: landing.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: landing.ogTitle || landing.title,
      description: landing.ogDescription || landing.metaDescription,
      url,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: `/solucoes/${slug}/opengraph-image`, width: 1200, height: 630, alt: landing.ogTitle || landing.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: landing.twitterTitle || landing.ogTitle || landing.title,
      description: landing.twitterDescription || landing.ogDescription || landing.metaDescription,
      images: [`/solucoes/${slug}/opengraph-image`],
    },
  }
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params
  const landing = await reader.collections.landingsVerticais.read(slug)
  if (!landing) notFound()

  const [allFaqs, allTools, allPosts] = await Promise.all([
    reader.collections.faqs.all(),
    reader.collections.ferramentas.all(),
    reader.collections.posts.all(),
  ])

  const faqsSlugs = (landing.faqsSlugs || []) as string[]
  const faqs = faqsSlugs
    .map((s) => allFaqs.find((f) => f.slug === s))
    .filter((f): f is (typeof allFaqs)[number] => Boolean(f))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  const ferramentaPrincipal = landing.ferramentaPrincipalSlug
    ? allTools.find((t) => t.slug === landing.ferramentaPrincipalSlug)
    : undefined

  const ferramentasSecundarias = ((landing.ferramentasSecundariasSlugs || []) as string[])
    .map((s) => allTools.find((t) => t.slug === s))
    .filter((t): t is (typeof allTools)[number] => Boolean(t))
    .map((t) => ({
      slug: t.slug,
      title: t.entry.title,
      h1: t.entry.h1,
      cardDescription: t.entry.cardDescription,
      icon: t.entry.icon,
    }))

  const postsRelacionados = ((landing.postsRelacionadosSlugs || []) as string[])
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p): p is (typeof allPosts)[number] => Boolean(p))
    .map((p) => ({
      slug: p.slug,
      title: p.entry.h1 || p.entry.title,
      resumo: p.entry.resumo,
    }))

  const heroBeneficios = ((landing.heroBeneficios || []) as Array<{ titulo: string; descricao: string; icone?: string }>)

  const ferramentaPrincipalRef = ferramentaPrincipal
    ? {
        slug: ferramentaPrincipal.slug,
        title: ferramentaPrincipal.entry.title,
        h1: ferramentaPrincipal.entry.h1,
        cardDescription: ferramentaPrincipal.entry.cardDescription,
        icon: ferramentaPrincipal.entry.icon,
      }
    : undefined

  const updIso = isoOrFallback(landing.dataAtualizacao, LAST_UPDATED_ISO)
  const url = `${BASE}/solucoes/${slug}`

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: landing.h1 || landing.title,
      description: landing.metaDescription,
      url,
      inLanguage: 'pt-BR',
      isPartOf: { '@id': `${BASE}/#website` },
      publisher: { '@id': `${BASE}/#organization` },
      dateModified: updIso,
      ...(ferramentaPrincipalRef
        ? {
            mainEntity: {
              '@type': 'WebApplication',
              name: ferramentaPrincipalRef.h1 || ferramentaPrincipalRef.title,
              url: `${BASE}/${ferramentaPrincipalRef.slug}`,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web Browser',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
              isAccessibleForFree: true,
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: landing.h1 || landing.title, item: url },
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
      <LandingVerticalLayout
        slug={slug}
        h1={landing.h1 || landing.title}
        subtitle={landing.subtitle}
        introducao={landing.introducao}
        heroBeneficios={heroBeneficios}
        casosDeUso={(landing.casosDeUso || []) as string[]}
        ferramentaPrincipal={ferramentaPrincipalRef}
        ferramentasSecundarias={ferramentasSecundarias}
        ctaTexto={landing.ctaTexto || 'Usar ferramenta grátis'}
        conteudoExtra={landing.conteudoExtra}
        postsRelacionados={postsRelacionados}
        faqs={faqs}
        dataAtualizacaoIso={updIso}
        dataAtualizacaoHumana={formatDateHuman(updIso)}
      />
    </>
  )
}
