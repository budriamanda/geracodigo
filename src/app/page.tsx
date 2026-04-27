import Link from 'next/link'
import type { Metadata } from 'next'
import SchemaMarkup from '@/components/SchemaMarkup'
import FAQSection from '@/components/FAQSection'
import AdSlot from '@/components/AdSlot'
import MarkdownContent from '@/components/MarkdownContent'
import { reader } from '@/lib/content'
import { SITE_URL } from '@/lib/constants'

export async function generateMetadata(): Promise<Metadata> {
  const [home, siteCfg] = await Promise.all([
    reader.singletons.homepage.read(),
    reader.singletons.siteConfig.read(),
  ])
  return {
    title: { absolute: home?.title ?? 'GeraCode | Código de Barras, QR Code Pix, EAN, Leitor e SKU Grátis' },
    description: home?.metaDescription ?? siteCfg?.siteDescription ?? '',
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: {
      title: home?.ogTitle ?? home?.title ?? 'GeraCode',
      description: home?.ogDescription ?? home?.metaDescription ?? '',
      url: `${SITE_URL}/`,
      type: 'website',
      locale: 'pt_BR',
      siteName: siteCfg?.siteName ?? 'GeraCode',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: home?.ogTitle ?? 'GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: home?.twitterTitle ?? home?.title ?? 'GeraCode',
      description: home?.twitterDescription ?? home?.metaDescription ?? '',
      images: ['/opengraph-image'],
    },
  }
}

export default async function HomePage() {
  const [home, seo, ferramentasAll, faqsAll, publicosAll] = await Promise.all([
    reader.singletons.homepage.read(),
    reader.singletons.globalSeo.read(),
    reader.collections.ferramentas.all(),
    reader.collections.faqs.all(),
    reader.collections.publicosAlvo.all(),
  ])

  const tools = ferramentasAll
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((t) => ({
      href: `/${t.slug}`,
      title: t.entry.h1,
      description: t.entry.cardDescription,
      badge: t.entry.badge || null,
      badgeColor: t.entry.badgeColor || '',
      icon: t.entry.icon,
    }))

  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'home')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  const publicos = publicosAll
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((p) => ({ title: p.entry.titulo, desc: p.entry.descricao }))

  const porqueUsarItems = home?.porqueUsarItems?.length
    ? home.porqueUsarItems
    : [
        { icone: '🔒', titulo: '100% Privado', descricao: 'Tudo gerado no seu navegador. Nenhum dado é enviado para servidores externos.' },
        { icone: '⚡', titulo: 'Completo e Gratuito', descricao: 'Ferramentas integradas sem limite de uso.' },
        { icone: '🇧🇷', titulo: 'Feito para o Brasil', descricao: 'QR Code Pix padrão Banco Central.' },
        { icone: '📦', titulo: 'Geração em Lote', descricao: 'ZIP, PDF, etiquetas direto do navegador.' },
      ]

  const comoFuncionaSteps = home?.comoFuncionaSteps?.length
    ? home.comoFuncionaSteps
    : [
        { step: '1', titulo: 'Escolha a ferramenta', descricao: 'Selecione o que precisa.' },
        { step: '2', titulo: 'Preencha os dados', descricao: 'Preview em tempo real.' },
        { step: '3', titulo: 'Baixe, imprima ou copie', descricao: 'Exporte em diversos formatos.' },
      ]

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: seo?.organizationName ?? 'GeraCode',
      url: SITE_URL,
      description: home?.metaDescription ?? seo?.defaultDescription ?? '',
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: seo?.organizationName ?? 'GeraCode',
      url: SITE_URL,
      logo: seo?.organizationLogo ?? `${SITE_URL}/logo.svg`,
      description: home?.metaDescription ?? seo?.defaultDescription ?? '',
      foundingDate: seo?.organizationFoundingDate ?? '2026-01-01',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${SITE_URL}/` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Ferramentas do GeraCode',
      description: 'Todas as ferramentas gratuitas de geração de código disponíveis no GeraCode',
      numberOfItems: tools.length,
      itemListElement: tools.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.title,
        item: `${SITE_URL}${t.href}`,
      })),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SchemaMarkup schema={schemas} />

      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {home?.heroH1 ?? 'Gerador de Código de Barras, QR Code Pix e SKU Grátis'}
        </h1>
        <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
          {home?.heroSubtitle ?? ''}
        </p>
        {home?.heroBadgeText && (
          <p className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mt-4">
            <span aria-hidden="true">{'\u{1F512}'}</span> {home.heroBadgeText}
          </p>
        )}
        {home?.heroCtaText && (
          <div className="mt-6">
            <a
              href={home?.heroCtaHref || '#ferramentas'}
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {home.heroCtaText}
            </a>
          </div>
        )}
      </section>

      {/* Ferramentas */}
      <section aria-labelledby="tools-heading" id="ferramentas">
        <h2 id="tools-heading" className="text-2xl font-bold text-gray-900 mb-6">{home?.ferramentasSectionTitle ?? 'Ferramentas Disponíveis'}</h2>
        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl" aria-hidden="true">{tool.icon}</span>
                  {tool.badge && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 mb-2">
                  {tool.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{tool.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center mb-16">
        <AdSlot slot="home-mid" format="responsive" />
      </div>

      {/* Por que usar o GeraCode */}
      <section aria-labelledby="why-geracode" className="bg-white rounded-xl border border-gray-200 p-8 mb-16">
        <h2 id="why-geracode" className="text-2xl font-bold text-gray-900 mb-6 text-center">{home?.porqueUsarTitle ?? 'Por que usar o GeraCode?'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {porqueUsarItems.map(({ icone, titulo, descricao }) => (
            <div key={titulo} className="flex flex-col gap-2">
              {icone && <span className="text-2xl" aria-hidden="true">{icone}</span>}
              <h3 className="font-semibold text-gray-900">{titulo}</h3>
              <p className="text-sm text-gray-500">{descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O que é o GeraCode */}
      {home?.oQueEContent && (
        <section aria-labelledby="about-geracode" className="mb-16">
          <h2 id="about-geracode" className="text-2xl font-bold text-gray-900 mb-4">{home?.oQueETitle ?? 'O que é o GeraCode?'}</h2>
          <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
            <MarkdownContent content={home.oQueEContent} />
          </div>
        </section>
      )}

      {/* Como funciona */}
      <section aria-labelledby="how-it-works" className="bg-white rounded-xl border border-gray-200 p-8 mb-16">
        <h2 id="how-it-works" className="text-2xl font-bold text-gray-900 mb-6 text-center">{home?.comoFuncionaTitle ?? 'Como funciona'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comoFuncionaSteps.map(({ step, titulo, descricao }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{titulo}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quem */}
      <section aria-labelledby="who-is-it-for" className="mb-16">
        <h2 id="who-is-it-for" className="text-2xl font-bold text-gray-900 mb-6">{home?.paraQuemTitle ?? 'Para quem é o GeraCode?'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publicos.map(({ title, desc }) => (
            <article key={title} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex justify-center mb-16">
        <AdSlot slot="home-bottom" format="responsive" />
      </div>

      {/* FAQ */}
      <FAQSection items={faqs} />
    </div>
  )
}
