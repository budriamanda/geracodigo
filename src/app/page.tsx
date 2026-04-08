import Link from 'next/link'
import type { Metadata } from 'next'
import SchemaMarkup from '@/components/SchemaMarkup'
import FAQSection from '@/components/FAQSection'
import AdSlot from '@/components/AdSlot'
import { reader } from '@/lib/content'

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.geracodigo.com.br/#website',
    name: 'GeraCode',
    url: 'https://www.geracodigo.com.br',
    description: 'Ferramentas gratuitas de geração de código de barras, QR Code Pix, leitor de código de barras e gerador de SKU para lojistas brasileiros',
    inLanguage: 'pt-BR',
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.geracodigo.com.br/#organization',
    name: 'GeraCode',
    url: 'https://www.geracodigo.com.br',
    logo: 'https://www.geracodigo.com.br/logo.svg',
    description: 'Ferramentas gratuitas de geração de código de barras, QR Code Pix e SKU para lojistas brasileiros',
    foundingDate: '2026-01-01',
    sameAs: [],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ferramentas do GeraCode',
    description: 'Todas as ferramentas gratuitas de geração de código disponíveis no GeraCode',
    numberOfItems: 6,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Gerador de QR Code Pix', item: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix' },
      { '@type': 'ListItem', position: 2, name: 'Gerador de Código de Barras', item: 'https://www.geracodigo.com.br/gerador-de-codigo-de-barras' },
      { '@type': 'ListItem', position: 3, name: 'Gerador de EAN-13 e EAN-8', item: 'https://www.geracodigo.com.br/gerador-de-ean' },
      { '@type': 'ListItem', position: 4, name: 'Gerador de QR Code', item: 'https://www.geracodigo.com.br/gerador-de-qr-code' },
      { '@type': 'ListItem', position: 5, name: 'Leitor de Código de Barras', item: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras' },
      { '@type': 'ListItem', position: 6, name: 'Gerador de SKU', item: 'https://www.geracodigo.com.br/gerador-de-sku' },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const config = await reader.singletons.siteConfig.read()
  return {
    title: { absolute: 'GeraCode | Código de Barras, QR Code Pix, EAN, Leitor e SKU Grátis' },
    description: config?.siteDescription ?? 'Gerador grátis de código de barras (12+ formatos), QR Code Pix, leitor de código de barras via câmera e gerador de SKU. Geração em lote, PDF, etiquetas. 100% privado, sem cadastro.',
    alternates: {
      canonical: 'https://www.geracodigo.com.br/',
    },
    openGraph: {
      title: 'GeraCode | Gerador de Código de Barras, QR Code Pix e SKU Grátis',
      description: 'Ferramentas gratuitas para lojistas brasileiros. 12+ formatos de código de barras, QR Code Pix, leitor via câmera e SKU. Sem cadastro.',
      url: 'https://www.geracodigo.com.br/',
      type: 'website',
      locale: 'pt_BR',
      siteName: config?.siteName ?? 'GeraCode',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GeraCode | Gerador de Código de Barras e QR Code Pix' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'GeraCode | Gerador de Código de Barras e QR Code Pix Grátis',
      description: 'Ferramentas gratuitas para lojistas brasileiros. Sem cadastro, sem servidor.',
      images: ['/opengraph-image'],
    },
  }
}

export default async function HomePage() {
  const [ferramentasAll, faqsAll, publicosAll] = await Promise.all([
    reader.collections.ferramentas.all(),
    reader.collections.faqs.all(),
    reader.collections.publicosAlvo.all(),
  ])

  const tools = ferramentasAll
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((t) => ({
      href: `/${t.entry.slug}`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SchemaMarkup schema={schemas} />

      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Gerador de Código de Barras, QR Code Pix e SKU Grátis
        </h1>
        <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
          6 ferramentas online gratuitas para lojistas e empreendedores brasileiros.
          Gere códigos de barras em 12+ formatos, QR Code Pix, leia códigos pela câmera e crie SKUs. Tudo em segundos.
        </p>
        <p className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mt-4">
          <span aria-hidden="true">{'\u{1F512}'}</span> 100% privado. Seus dados nunca saem do seu navegador
        </p>
        <div className="mt-6">
          <a
            href="#ferramentas"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Comece a gerar agora
          </a>
        </div>
      </section>

      {/* Ferramentas */}
      <section aria-labelledby="tools-heading" id="ferramentas">
        <h2 id="tools-heading" className="text-2xl font-bold text-gray-900 mb-6">Ferramentas Disponíveis</h2>
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
        <h2 id="why-geracode" className="text-2xl font-bold text-gray-900 mb-6 text-center">Por que usar o GeraCode?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-2xl" aria-hidden="true">{'\u{1F512}'}</span>
            <h3 className="font-semibold text-gray-900">100% Privado</h3>
            <p className="text-sm text-gray-500">Tudo gerado no seu navegador. Nenhum dado é enviado para servidores externos. Sua privacidade é total.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl" aria-hidden="true">{'\u26A1'}</span>
            <h3 className="font-semibold text-gray-900">Completo e Gratuito</h3>
            <p className="text-sm text-gray-500">12 formatos de código de barras, geração em lote, PDF, etiquetas, leitor via câmera e gerador de SKU. Tudo grátis, sem limite.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl" aria-hidden="true">{'\u{1F1E7}\u{1F1F7}'}</span>
            <h3 className="font-semibold text-gray-900">Feito para o Brasil</h3>
            <p className="text-sm text-gray-500">QR Code Pix com payload BR Code no padrão do Banco Central. Compatível com Nubank, Itaú, Bradesco e todos os bancos.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl" aria-hidden="true">{'\u{1F4E6}'}</span>
            <h3 className="font-semibold text-gray-900">Geração em Lote</h3>
            <p className="text-sm text-gray-500">Gere dezenas de códigos de uma vez. Cole do Excel, baixe em ZIP ou PDF, imprima etiquetas direto do navegador.</p>
          </div>
        </div>
      </section>

      {/* O que e o GeraCode */}
      <section aria-labelledby="about-geracode" className="mb-16">
        <h2 id="about-geracode" className="text-2xl font-bold text-gray-900 mb-4">O que é o GeraCode?</h2>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
          <p>
            O <strong>GeraCode</strong> reúne 6 ferramentas gratuitas de códigos para <strong>lojistas, empreendedores e pequenos negócios brasileiros</strong>.
            Com 6 ferramentas integradas, você pode gerar códigos de barras em 12 formatos (EAN-13, Code 128, Code 93, UPC-A, ITF-14, Codabar e mais),
            QR Codes genéricos, <strong>QR Code Pix</strong> com payload BR Code EMV válido, ler códigos de barras pela câmera e criar códigos SKU padronizados.
          </p>
          <p>
            Diferente de outras ferramentas, o GeraCode processa tudo localmente no seu dispositivo. Nenhuma informação é enviada para servidores,
            garantindo <strong>total privacidade e segurança</strong>. Inclui funcionalidades como <strong>geração em lote, download em PDF, impressão de etiquetas,
            cálculo automático do dígito verificador (CRC16 para Pix)</strong> e <strong>histórico local</strong>. Tudo 100% no navegador, sem depender de servidores externos.
          </p>
        </div>
      </section>

      {/* Como funciona */}
      <section aria-labelledby="how-it-works" className="bg-white rounded-xl border border-gray-200 p-8 mb-16">
        <h2 id="how-it-works" className="text-2xl font-bold text-gray-900 mb-6 text-center">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Escolha a ferramenta', desc: 'Selecione o que precisa: código de barras (12 formatos), QR Code Pix, QR Code genérico, leitor de código de barras ou gerador de SKU.' },
            { step: '2', title: 'Preencha os dados', desc: 'Insira as informações necessárias. Personalize cores, tamanhos e estilos. O preview é gerado automaticamente em tempo real.' },
            { step: '3', title: 'Baixe, imprima ou copie', desc: 'Download em PNG, SVG ou PDF. Gere em lote e baixe em ZIP. Imprima etiquetas. Copie códigos para a área de transferência.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center mx-auto mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para quem */}
      <section aria-labelledby="who-is-it-for" className="mb-16">
        <h2 id="who-is-it-for" className="text-2xl font-bold text-gray-900 mb-6">Para quem é o GeraCode?</h2>
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
