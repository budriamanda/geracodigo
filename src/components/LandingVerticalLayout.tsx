import Link from 'next/link'
import AdSlot from '@/components/AdSlot'
import Breadcrumb from '@/components/Breadcrumb'
import CTAFerramenta from '@/components/CTAFerramenta'
import FAQSection from '@/components/FAQSection'
import LastUpdated from '@/components/LastUpdated'
import MarkdownContent from '@/components/MarkdownContent'

interface ToolRef {
  slug: string
  title: string
  h1?: string
  cardDescription?: string
  icon?: string
}

interface RelatedPost {
  slug: string
  title: string
  resumo?: string
}

interface FAQItem {
  question: string
  answer: string
}

interface Beneficio {
  titulo: string
  descricao: string
  icone?: string
}

export interface LandingVerticalLayoutProps {
  slug: string
  h1: string
  subtitle?: string
  introducao?: string
  heroBeneficios: Beneficio[]
  casosDeUso: string[]
  ferramentaPrincipal?: ToolRef
  ferramentasSecundarias: ToolRef[]
  ctaTexto: string
  conteudoExtra?: string
  postsRelacionados: RelatedPost[]
  faqs: FAQItem[]
  dataAtualizacaoHumana: string
  dataAtualizacaoIso: string
}

export default function LandingVerticalLayout({
  slug,
  h1,
  subtitle,
  introducao,
  heroBeneficios,
  casosDeUso,
  ferramentaPrincipal,
  ferramentasSecundarias,
  ctaTexto,
  conteudoExtra,
  postsRelacionados,
  faqs,
  dataAtualizacaoHumana,
  dataAtualizacaoIso,
}: LandingVerticalLayoutProps) {
  const ctaHref = ferramentaPrincipal ? `/${ferramentaPrincipal.slug}` : undefined
  const ctaTitulo = ferramentaPrincipal?.h1 || ferramentaPrincipal?.title || 'Use a ferramenta grátis'
  const ctaDesc = ferramentaPrincipal?.cardDescription

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb current={h1} />

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">{h1}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        <LastUpdated date={dataAtualizacaoHumana} isoDate={dataAtualizacaoIso} />
      </header>

      {introducao && (
        <div className="prose prose-gray max-w-none mb-8">
          <MarkdownContent content={introducao} />
        </div>
      )}

      {ctaHref && (
        <CTAFerramenta
          href={ctaHref}
          titulo={ctaTitulo}
          descricao={ctaDesc}
          ctaTexto={ctaTexto}
          ctaId={`landing_${slug}_cta_top`}
          variant="primary"
        />
      )}

      <div className="flex justify-center my-8">
        <AdSlot slot={`landing-${slug}-top`} format="horizontal" />
      </div>

      {heroBeneficios.length > 0 && (
        <section className="mt-12" aria-labelledby="beneficios-heading">
          <h2 id="beneficios-heading" className="text-2xl font-bold text-gray-900 mb-6">
            Por que usar o GeraCode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroBeneficios.map((b, i) => (
              <article key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                {b.icone && (
                  <div className="text-3xl mb-2" aria-hidden="true">{b.icone}</div>
                )}
                <h3 className="font-semibold text-gray-900 mb-1">{b.titulo}</h3>
                <p className="text-sm text-gray-600">{b.descricao}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {casosDeUso.length > 0 && (
        <section className="mt-12 bg-white rounded-xl border border-gray-200 p-6 sm:p-8" aria-labelledby="casos-heading">
          <h2 id="casos-heading" className="text-2xl font-bold text-gray-900 mb-4">Casos de uso</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            {casosDeUso.map((caso) => (
              <li key={caso} className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5" aria-hidden="true">✓</span>
                <span>{caso}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {conteudoExtra && (
        <section className="mt-12 prose prose-gray max-w-none">
          <MarkdownContent content={conteudoExtra} />
        </section>
      )}

      <div className="flex justify-center my-8">
        <AdSlot slot={`landing-${slug}-mid`} format="responsive" />
      </div>

      {ferramentasSecundarias.length > 0 && (
        <section className="mt-12" aria-labelledby="outras-ferramentas">
          <h2 id="outras-ferramentas" className="text-2xl font-bold text-gray-900 mb-6">
            Ferramentas complementares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ferramentasSecundarias.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {tool.icon && <div className="text-2xl mb-2" aria-hidden="true">{tool.icon}</div>}
                <h3 className="font-semibold text-gray-900 mb-1">{tool.h1 || tool.title}</h3>
                {tool.cardDescription && (
                  <p className="text-sm text-gray-500">{tool.cardDescription}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {postsRelacionados.length > 0 && (
        <section className="mt-12" aria-labelledby="posts-relacionados">
          <h2 id="posts-relacionados" className="text-2xl font-bold text-gray-900 mb-6">Leia também</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postsRelacionados.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                {p.resumo && <p className="text-sm text-gray-500 line-clamp-2">{p.resumo}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {ctaHref && (
        <CTAFerramenta
          href={ctaHref}
          titulo={ctaTitulo}
          descricao={ctaDesc}
          ctaTexto={ctaTexto}
          ctaId={`landing_${slug}_cta_bottom`}
          variant="primary"
        />
      )}

      {faqs.length > 0 && <FAQSection items={faqs} />}

      <div className="flex justify-center mt-12">
        <AdSlot slot={`landing-${slug}-bottom`} format="horizontal" />
      </div>
    </div>
  )
}
