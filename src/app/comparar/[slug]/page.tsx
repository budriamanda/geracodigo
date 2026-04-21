import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdSlot from '@/components/AdSlot'
import Breadcrumb from '@/components/Breadcrumb'
import ComparisonTable from '@/components/ComparisonTable'
import CTAFerramenta from '@/components/CTAFerramenta'
import FAQSection from '@/components/FAQSection'
import LastUpdated from '@/components/LastUpdated'
import MarkdownContent from '@/components/MarkdownContent'
import SchemaMarkup from '@/components/SchemaMarkup'
import { reader } from '@/lib/content'
import { formatDateHuman, isoOrFallback } from '@/lib/dates'
import { LAST_UPDATED_ISO } from '@/lib/constants'

const BASE = 'https://www.geracodigo.com.br'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const items = await reader.collections.comparacoes.all()
  return items.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = await reader.collections.comparacoes.read(slug)
  if (!item) return {}
  const url = `${BASE}/comparar/${slug}`
  return {
    title: item.title,
    description: item.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: item.ogTitle || item.title,
      description: item.ogDescription || item.metaDescription,
      url,
      type: 'article',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: `/comparar/${slug}/opengraph-image`, width: 1200, height: 630, alt: item.ogTitle || item.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.twitterTitle || item.ogTitle || item.title,
      description: item.twitterDescription || item.ogDescription || item.metaDescription,
      images: [`/comparar/${slug}/opengraph-image`],
    },
  }
}

export default async function ComparacaoPage({ params }: PageProps) {
  const { slug } = await params
  const item = await reader.collections.comparacoes.read(slug)
  if (!item) notFound()

  const [allFaqs, allTools, allPosts] = await Promise.all([
    reader.collections.faqs.all(),
    reader.collections.ferramentas.all(),
    reader.collections.posts.all(),
  ])

  const faqsSlugs = (item.faqsSlugs || []) as string[]
  const faqs = faqsSlugs
    .map((s) => allFaqs.find((f) => f.slug === s))
    .filter((f): f is (typeof allFaqs)[number] => Boolean(f))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  const ferramentasRelacionadas = ((item.ferramentasRelacionadasSlugs || []) as string[])
    .map((s) => allTools.find((t) => t.slug === s))
    .filter((t): t is (typeof allTools)[number] => Boolean(t))

  const postsRelacionados = ((item.postsRelacionadosSlugs || []) as string[])
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p): p is (typeof allPosts)[number] => Boolean(p))

  const rows = ((item.tabelaComparativa || []) as Array<{ criterio: string; valorA: string; valorB: string }>)

  const updIso = isoOrFallback(item.dataAtualizacao, LAST_UPDATED_ISO)
  const url = `${BASE}/comparar/${slug}`

  const schemas: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: item.h1 || item.title,
      description: item.metaDescription,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      dateModified: updIso,
      datePublished: updIso,
      inLanguage: 'pt-BR',
      author: { '@id': `${BASE}/#organization` },
      publisher: { '@id': `${BASE}/#organization` },
      image: [`${BASE}/comparar/${slug}/opengraph-image`],
      about: [
        { '@type': 'Thing', name: item.termoA },
        { '@type': 'Thing', name: item.termoB },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: `${item.termoA} vs ${item.termoB}`, item: url },
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

  const ferramentaCTA = ferramentasRelacionadas[0]

  return (
    <>
      <SchemaMarkup schema={schemas} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb current={`${item.termoA} vs ${item.termoB}`} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {item.h1 || item.title}
          </h1>
          {item.subtitle && <p className="text-lg text-gray-600">{item.subtitle}</p>}
          <LastUpdated date={formatDateHuman(updIso)} isoDate={updIso} />
        </header>

        <div className="flex justify-center mb-6">
          <AdSlot slot={`comp-${slug}-top`} format="horizontal" />
        </div>

        {item.introducao && (
          <div className="prose prose-gray max-w-none mb-8">
            <MarkdownContent content={item.introducao} />
          </div>
        )}

        <ComparisonTable termoA={item.termoA} termoB={item.termoB} rows={rows} />

        {ferramentaCTA && (
          <CTAFerramenta
            href={`/${ferramentaCTA.slug}`}
            titulo={ferramentaCTA.entry.h1 || ferramentaCTA.entry.title}
            descricao={ferramentaCTA.entry.cardDescription}
            ctaTexto="Testar agora grátis"
            ctaId={`compare_${slug}_cta_top`}
            variant="soft"
          />
        )}

        {(item.quandoUsarA || item.quandoUsarB) && (
          <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {item.quandoUsarA && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-indigo-900 mb-3">Quando usar {item.termoA}</h2>
                <div className="prose prose-gray max-w-none text-gray-800">
                  <MarkdownContent content={item.quandoUsarA} />
                </div>
              </div>
            )}
            {item.quandoUsarB && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-emerald-900 mb-3">Quando usar {item.termoB}</h2>
                <div className="prose prose-gray max-w-none text-gray-800">
                  <MarkdownContent content={item.quandoUsarB} />
                </div>
              </div>
            )}
          </section>
        )}

        {item.veredito && (
          <section className="mt-10 bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Veredito</h2>
            <div className="prose prose-gray max-w-none text-gray-700">
              <MarkdownContent content={item.veredito} />
            </div>
          </section>
        )}

        {item.conteudoExtra && (
          <section className="mt-10 prose prose-gray max-w-none">
            <MarkdownContent content={item.conteudoExtra} />
          </section>
        )}

        <div className="flex justify-center my-8">
          <AdSlot slot={`comp-${slug}-mid`} format="responsive" />
        </div>

        {ferramentasRelacionadas.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ferramentas relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ferramentasRelacionadas.map((t) => (
                <Link
                  key={t.slug}
                  href={`/${t.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {t.entry.icon && <div className="text-2xl mb-1" aria-hidden="true">{t.entry.icon}</div>}
                  <h3 className="font-semibold text-gray-900 mb-1">{t.entry.h1 || t.entry.title}</h3>
                  {t.entry.cardDescription && <p className="text-sm text-gray-500">{t.entry.cardDescription}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {postsRelacionados.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Leia também</h2>
            <ul className="space-y-2">
              {postsRelacionados.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-indigo-600 underline hover:text-indigo-800"
                  >
                    {p.entry.h1 || p.entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {faqs.length > 0 && <FAQSection items={faqs} />}

        <div className="flex justify-center mt-12">
          <AdSlot slot={`comp-${slug}-bottom`} format="horizontal" />
        </div>
      </div>
    </>
  )
}
