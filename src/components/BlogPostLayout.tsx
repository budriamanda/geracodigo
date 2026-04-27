import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import Breadcrumb from '@/components/Breadcrumb'
import CTAFerramenta from '@/components/CTAFerramenta'
import FAQSection from '@/components/FAQSection'
import LastUpdated from '@/components/LastUpdated'

const AUTHOR_SLUGS: Record<string, string> = {
  'Amanda Budri': 'amanda-budri',
}
import MarkdownContent from '@/components/MarkdownContent'
import RelatedTools from '@/components/RelatedTools'

interface ToolRef {
  slug: string
  title: string
  h1?: string
  cardDescription?: string
}

interface FAQItem {
  question: string
  answer: string
}

export interface BlogPostLayoutProps {
  slug: string
  title: string
  h1: string
  subtitle?: string
  resumo?: string
  autor: string
  dataPublicacaoHumana: string
  dataPublicacaoIso: string
  dataAtualizacaoHumana: string
  dataAtualizacaoIso: string
  tempoLeitura?: number
  categoria?: string
  tags?: string[]
  bodyMarkdown: string
  ferramentaRelacionada?: ToolRef
  faqs: FAQItem[]
}

export default function BlogPostLayout({
  slug,
  title,
  h1,
  subtitle,
  resumo,
  autor,
  dataPublicacaoHumana,
  dataPublicacaoIso,
  dataAtualizacaoHumana,
  dataAtualizacaoIso,
  tempoLeitura,
  categoria,
  tags,
  bodyMarkdown,
  ferramentaRelacionada,
  faqs,
}: BlogPostLayoutProps) {
  const ctaHref = ferramentaRelacionada ? `/${ferramentaRelacionada.slug}` : undefined
  const ctaTitulo = ferramentaRelacionada?.h1 || ferramentaRelacionada?.title || 'Use as ferramentas grátis do GeraCode'
  const ctaDesc = ferramentaRelacionada?.cardDescription

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb current={title} trail={[{ label: 'Blog', href: '/blog' }]} />

      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          {categoria && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
              {labelCategoria(categoria)}
            </span>
          )}
          {tempoLeitura && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
              {tempoLeitura} min de leitura
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">{h1}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span>
            Por{' '}
            {AUTHOR_SLUGS[autor] ? (
              <Link
                href={`/autor/${AUTHOR_SLUGS[autor]}`}
                className="font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {autor}
              </Link>
            ) : (
              <strong className="text-gray-700 font-medium">{autor}</strong>
            )}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Publicado em{' '}
            <time dateTime={dataPublicacaoIso}>{dataPublicacaoHumana}</time>
          </span>
        </div>
        <LastUpdated date={dataAtualizacaoHumana} isoDate={dataAtualizacaoIso} />
      </header>

      <div className="flex justify-center mb-6">
        <AdSlot slot={`blog-${slug}-top`} format="horizontal" />
      </div>

      {resumo && (
        <p className="text-lg text-gray-800 font-medium bg-gray-50 border-l-4 border-indigo-500 pl-4 pr-4 py-3 mb-8 rounded-r-lg">
          {resumo}
        </p>
      )}

      {ctaHref && (
        <CTAFerramenta
          href={ctaHref}
          titulo={ctaTitulo}
          descricao={ctaDesc}
          ctaTexto="Abrir ferramenta"
          ctaId={`blog_${slug}_cta_top`}
          variant="soft"
        />
      )}

      <div className="prose prose-gray max-w-none">
        <MarkdownContent content={bodyMarkdown} />
      </div>

      <div className="flex justify-center my-8">
        <AdSlot slot={`blog-${slug}-mid`} format="responsive" />
      </div>

      {ctaHref && (
        <CTAFerramenta
          href={ctaHref}
          titulo={ctaTitulo}
          descricao={ctaDesc}
          ctaTexto="Ir para a ferramenta"
          ctaId={`blog_${slug}_cta_bottom`}
          variant="primary"
        />
      )}

      {tags && tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {faqs.length > 0 && <FAQSection items={faqs} />}

      <div className="flex justify-center mt-12">
        <AdSlot slot={`blog-${slug}-bottom`} format="horizontal" />
      </div>

      {ferramentaRelacionada && (
        <RelatedTools currentPath={`/${ferramentaRelacionada.slug}`} />
      )}
    </article>
  )
}

function labelCategoria(cat: string): string {
  const map: Record<string, string> = {
    pix: 'QR Code Pix',
    'codigo-barras': 'Código de Barras',
    ean: 'EAN',
    sku: 'SKU',
    leitor: 'Leitor',
    'qr-code': 'QR Code',
    geral: 'Geral',
  }
  return map[cat] ?? cat
}
