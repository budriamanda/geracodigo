import SchemaMarkup from '@/components/SchemaMarkup'
import Breadcrumb from '@/components/Breadcrumb'
import AdSlot from '@/components/AdSlot'
import MarkdownContent from '@/components/MarkdownContent'
import { SITE_URL } from '@/lib/constants'

export interface InstitucionalPage {
  slug: string
  title?: string | null
  h1?: string | null
  subtitulo?: string | null
  metaDescription?: string | null
  schemaType?: string | null
  schemaDatePublished?: string | null
  schemaDateModified?: string | null
  breadcrumbLabel?: string | null
  containerWidth?: string | null
  bgCard?: boolean | null
  showMidAd?: boolean | null
  bodyMarkdown?: string | null
}

export default function InstitucionalLayout({ page }: { page: InstitucionalPage }) {
  const url = `${SITE_URL}/${page.slug}`
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': page.schemaType || 'WebPage',
      name: page.h1 || page.title || '',
      description: page.metaDescription || '',
      url,
      inLanguage: 'pt-BR',
      ...(page.schemaDatePublished ? { datePublished: page.schemaDatePublished } : {}),
      ...(page.schemaDateModified ? { dateModified: page.schemaDateModified } : {}),
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      ...(page.schemaType === 'AboutPage' ? { mainEntity: { '@id': `${SITE_URL}/#organization` } } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: page.breadcrumbLabel || page.h1 || '', item: url },
      ],
    },
  ]

  const maxW = page.containerWidth === '4xl' ? 'max-w-4xl' : 'max-w-3xl'
  const midIndex = page.showMidAd ? Math.floor((page.bodyMarkdown || '').length / 2) : -1

  return (
    <div className={`${maxW} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
      <SchemaMarkup schema={schemas} />
      <Breadcrumb current={page.breadcrumbLabel || page.h1 || ''} />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{page.h1}</h1>
      {page.subtitulo && (
        <p className="text-gray-500 text-sm mb-8">{page.subtitulo}</p>
      )}
      {!page.subtitulo && <div className="mb-6" />}

      {page.bgCard ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <MarkdownContent content={page.bodyMarkdown} />
        </div>
      ) : (
        <div className="prose prose-gray max-w-none">
          <MarkdownContent content={page.bodyMarkdown} />
        </div>
      )}

      {page.showMidAd && midIndex >= 0 && (
        <div className="flex justify-center my-12">
          <AdSlot slot={`${page.slug}-mid`} format="responsive" />
        </div>
      )}
    </div>
  )
}
