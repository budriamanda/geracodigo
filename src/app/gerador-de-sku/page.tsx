import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import FAQSection from '@/components/FAQSection'
import AdSlot from '@/components/AdSlot'
import SchemaMarkup from '@/components/SchemaMarkup'
import RelatedTools from '@/components/RelatedTools'
import Breadcrumb from '@/components/Breadcrumb'
import LastUpdated from '@/components/LastUpdated'
import GeneratorSkeleton from '@/components/GeneratorSkeleton'
import { LAST_UPDATED, LAST_UPDATED_ISO } from '@/lib/constants'
import { reader } from '@/lib/content'

const SkuGeneratorClient = dynamic(() => import('./SkuGeneratorClient'), {
  loading: () => <GeneratorSkeleton />,
})

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Gerador de SKU',
    description: 'Gere códigos SKU padronizados para seus produtos. Defina prefixo, categoria, atributos e sequencial. Geração em lote com exportação CSV.',
    url: 'https://www.geracodigo.com.br/gerador-de-sku',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    author: { '@id': 'https://www.geracodigo.com.br/#organization' },
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    featureList: [
      'Geração de SKU padronizado', 'Prefixo de marca', 'Categoria de produto',
      'Atributos customizáveis (cor, tamanho)', 'Número sequencial',
      'Geração em lote (até 500)', 'Exportação CSV', 'Preview em tempo real',
      '100% client-side',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como criar códigos SKU para produtos',
    description: 'Passo a passo para gerar SKUs padronizados para controle de estoque.',
    totalTime: 'PT3M',
    inLanguage: 'pt-BR',
    tool: { '@type': 'HowToTool', name: 'GeraCode: Gerador de SKU' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Defina o padrão', text: 'Escolha um prefixo para sua marca, uma abreviação para a categoria e atributos como cor e tamanho.' },
      { '@type': 'HowToStep', position: 2, name: 'Configure a quantidade', text: 'Defina o número sequencial inicial e quantos SKUs deseja gerar de uma vez.' },
      { '@type': 'HowToStep', position: 3, name: 'Gere e exporte', text: 'Clique em Gerar, copie os SKUs ou exporte em CSV para importar no seu sistema.' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gerador de SKU Grátis Online',
    description: 'Gere códigos SKU padronizados para seus produtos. Defina prefixo, categoria, atributos e sequencial. Geração em lote com exportação CSV.',
    url: 'https://www.geracodigo.com.br/gerador-de-sku',
    inLanguage: 'pt-BR',
    datePublished: '2026-02-10',
    dateModified: '2026-03-27',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    about: { '@type': 'Thing', name: 'SKU (Stock Keeping Unit)' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Gerador de SKU', item: 'https://www.geracodigo.com.br/gerador-de-sku' },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const tool = await reader.collections.ferramentas.read('gerador-de-sku')
  return {
    title: tool?.title ?? 'Gerador de SKU Grátis | Códigos para Estoque',
    description: tool?.metaDescription ?? 'Gerador de SKU grátis para controle de estoque. Defina prefixo, categoria, cor, tamanho e gere até 500 SKUs de uma vez. Exportação CSV. Sem cadastro.',
    alternates: { canonical: 'https://www.geracodigo.com.br/gerador-de-sku' },
    openGraph: {
      title: tool?.ogTitle ?? 'Gerador de SKU Grátis | Códigos para Controle de Estoque | GeraCode',
      description: tool?.ogDescription ?? 'Gere SKUs padronizados para seus produtos. Lote, CSV, sem cadastro.',
      url: 'https://www.geracodigo.com.br/gerador-de-sku',
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: '/gerador-de-sku/opengraph-image', width: 1200, height: 630, alt: 'Gerador de SKU Grátis | GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool?.twitterTitle ?? 'Gerador de SKU Grátis | GeraCode',
      description: tool?.twitterDescription ?? 'Crie SKUs padronizados para controle de estoque. Lote e CSV.',
      images: ['/gerador-de-sku/opengraph-image'],
    },
  }
}

export default async function SkuPage() {
  const [tool, faqsAll] = await Promise.all([
    reader.collections.ferramentas.read('gerador-de-sku'),
    reader.collections.faqs.all(),
  ])
  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'sku')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot="sku-top" format="horizontal" />
      </div>
      <Breadcrumb current="Gerador de SKU" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool?.h1 ?? 'Gerador de SKU Grátis Online'}</h1>
        <p className="text-gray-600">{tool?.subtitle ?? 'Crie códigos SKU padronizados para organizar seu estoque. Geração em lote com exportação CSV.'}</p>
        <p className="text-sm text-indigo-600 mt-1">Tudo processado no seu navegador. Nenhum dado sai do seu dispositivo</p>
        <LastUpdated date={LAST_UPDATED} isoDate={LAST_UPDATED_ISO} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <SkuGeneratorClient />
        </div>
        <aside className="lg:w-[300px] flex justify-center lg:justify-start">
          <AdSlot slot="sku-sidebar" format="rectangle" />
        </aside>
      </div>

      {/* Como funciona */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Como criar códigos SKU</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Defina o padrão', desc: 'Escolha um prefixo para identificar sua marca/loja (ex: LOJA), uma abreviação para a categoria (ex: CAM para camiseta) e atributos como cor e tamanho.' },
            { step: '2', title: 'Configure a quantidade', desc: 'Defina o número sequencial inicial e quantos SKUs deseja gerar (até 500 de uma vez). O preview mostra como ficará o SKU em tempo real.' },
            { step: '3', title: 'Gere e exporte', desc: 'Clique em Gerar. Copie os SKUs para a área de transferência ou baixe em CSV para importar no seu ERP, planilha ou plataforma de e-commerce.' },
          ].map(({ step, title, desc }) => (
            <article key={step} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold text-lg flex items-center justify-center mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* O que e SKU */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">O que é SKU?</h2>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
          <p>
            <strong>SKU (Stock Keeping Unit)</strong> é um código interno criado pela própria empresa para identificar cada variação de produto no estoque.
            Diferente do código de barras EAN (que é universal e registrado na GS1), o SKU é definido livremente pelo lojista.
          </p>
          <p>
            Um bom sistema de SKU facilita a <strong>gestão de estoque</strong>, permite localizar produtos rapidamente, evita erros no
            despacho e melhora a organização geral do catálogo.
          </p>
          <p>
            Exemplo: <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">LOJA-CAM-AZL-M-0001</code> identifica
            a camiseta azul tamanho M, número 0001, da loja.
          </p>
        </div>
      </section>

      <div className="flex justify-center mt-16">
        <AdSlot slot="sku-mid" format="responsive" />
      </div>

      {/* Boas praticas */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Boas práticas para criar SKUs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Seja consistente', desc: 'Defina um padrão e mantenha-o para todos os produtos. Use sempre a mesma quantidade de caracteres para cada campo.' },
            { title: 'Use abreviações claras', desc: 'CAM para camiseta, CAL para calça, AZL para azul, VRM para vermelho. Qualquer pessoa da equipe deve entender o código.' },
            { title: 'Evite caracteres especiais', desc: 'Use apenas letras maiúsculas, números e separadores simples (hífen ou underline). Evite acentos, espaços e caracteres especiais.' },
            { title: 'Inclua número sequencial', desc: 'O sequencial garante unicidade mesmo quando dois produtos compartilham categoria e atributos. Use 4 dígitos (0001-9999).' },
            { title: 'Não confunda com EAN', desc: 'SKU é interno da sua empresa. EAN é universal e registrado na GS1. Um produto pode (e deve) ter ambos.' },
            { title: 'Documente o padrão', desc: 'Crie uma tabela de referência com as abreviações usadas. Compartilhe com toda a equipe para manter a consistência.' },
          ].map(({ title, desc }) => (
            <article key={title} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SKU vs EAN */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">SKU vs Código de Barras (EAN): Qual a diferença?</h2>
        <div className="text-gray-600 space-y-4">
          <p>
            O <strong>SKU</strong> é um código interno, definido livremente por cada empresa. Não segue padrão universal e serve para
            organização interna do estoque, controle de variações (cor, tamanho) e logística interna.
          </p>
          <p>
            O <strong>EAN (código de barras)</strong> é um padrão global administrado pela GS1. É lido por leitores ópticos no ponto de
            venda e identifica o produto em qualquer sistema comercial do mundo.
          </p>
          <p>
            <strong>Na prática:</strong> use SKU para organizar seu estoque internamente e EAN para identificar o produto no mercado.
            Um produto pode ter ambos. Use o <Link href="/gerador-de-codigo-de-barras" className="text-indigo-600 hover:underline">Gerador de Código de Barras</Link> para criar os códigos EAN e este gerador para os SKUs.
          </p>
        </div>
      </section>

      <FAQSection items={faqs} />

      <div className="flex justify-center mt-8">
        <AdSlot slot="sku-bottom" format="horizontal" />
      </div>

      <RelatedTools currentPath="/gerador-de-sku" />
    </div>
  )
}
