import type { Metadata } from 'next'
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

const EanGenerator = dynamic(() => import('./EanGenerator'), {
  loading: () => <GeneratorSkeleton />,
})

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Gerador de EAN-13 e EAN-8',
    description: 'Crie códigos EAN-13 e EAN-8 para produtos, e-commerce e varejo. Geração instantânea no navegador, download imediato em PNG e SVG.',
    url: 'https://www.geracodigo.com.br/gerador-de-ean',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    author: { '@id': 'https://www.geracodigo.com.br/#organization' },
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    featureList: ['EAN-13', 'EAN-8', 'Validação automática do dígito verificador', 'Download PNG, SVG e PDF', '100% client-side'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como gerar código EAN-13 para produto',
    description: 'Passo a passo para criar código EAN-13 ou EAN-8 para produtos de varejo.',
    totalTime: 'PT2M',
    inLanguage: 'pt-BR',
    tool: { '@type': 'HowToTool', name: 'GeraCode: Gerador de EAN' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Escolha EAN-13 ou EAN-8', text: 'EAN-13 para a maioria dos produtos. EAN-8 para embalagens pequenas.', url: 'https://www.geracodigo.com.br/gerador-de-ean#passo-1' },
      { '@type': 'HowToStep', position: 2, name: 'Digite o número EAN', text: 'Informe todos os dígitos incluindo o dígito verificador (último dígito).', url: 'https://www.geracodigo.com.br/gerador-de-ean#passo-2' },
      { '@type': 'HowToStep', position: 3, name: 'Baixe em PNG, SVG ou PDF', text: 'Faça download imediato para usar em embalagens, etiquetas ou sistemas de PDV.', url: 'https://www.geracodigo.com.br/gerador-de-ean#passo-3' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gerador de EAN-13 e EAN-8 Grátis Online',
    description: 'Crie códigos EAN-13 e EAN-8 grátis para produtos, e-commerce e varejo. Download instantâneo em PNG, SVG e PDF. Sem cadastro, 100% privado.',
    url: 'https://www.geracodigo.com.br/gerador-de-ean',
    inLanguage: 'pt-BR',
    datePublished: '2026-01-15',
    dateModified: '2026-03-01',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    about: { '@type': 'Thing', name: 'EAN (European Article Number / GTIN)' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Gerador de EAN-13 e EAN-8', item: 'https://www.geracodigo.com.br/gerador-de-ean' },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const tool = await reader.collections.ferramentas.read('gerador-de-ean')
  return {
    title: tool?.title ?? 'Gerador de EAN-13 e EAN-8 Grátis Online',
    description: tool?.metaDescription ?? 'Crie códigos EAN-13 e EAN-8 grátis para produtos, e-commerce e varejo. Download instantâneo em PNG, SVG e PDF. Sem cadastro, 100% privado.',
    alternates: {
      canonical: 'https://www.geracodigo.com.br/gerador-de-ean',
    },
    openGraph: {
      title: tool?.ogTitle ?? 'Gerador de EAN-13 e EAN-8 Grátis Online | GeraCode',
      description: tool?.ogDescription ?? 'Crie códigos EAN-13 e EAN-8 grátis para produtos, e-commerce e varejo. Download instantâneo em PNG, SVG e PDF. Sem cadastro.',
      url: 'https://www.geracodigo.com.br/gerador-de-ean',
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: '/gerador-de-ean/opengraph-image', width: 1200, height: 630, alt: 'Gerador de EAN-13 e EAN-8 Grátis | GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool?.twitterTitle ?? 'Gerador de EAN-13 e EAN-8 Grátis | GeraCode',
      description: tool?.twitterDescription ?? 'Crie códigos EAN para produtos e varejo. Download PNG, SVG e PDF. Sem cadastro.',
      images: ['/gerador-de-ean/opengraph-image'],
    },
  }
}

export default async function EanPage() {
  const [tool, faqsAll] = await Promise.all([
    reader.collections.ferramentas.read('gerador-de-ean'),
    reader.collections.faqs.all(),
  ])
  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'ean')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot="ean-top" format="horizontal" />
      </div>
      <Breadcrumb current="Gerador de EAN-13 e EAN-8" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool?.h1 ?? 'Gerador de EAN-13 e EAN-8 Grátis Online'}</h1>
        <p className="text-gray-600">{tool?.subtitle ?? 'Crie códigos EAN para produtos, e-commerce e varejo. Geração instantânea no navegador.'}</p>
        <p className="text-sm text-indigo-600 mt-1"><span aria-hidden="true">{'\u{1F512}'}</span> Gerado direto no seu navegador. Seus dados nunca saem do seu computador</p>
        <LastUpdated date={LAST_UPDATED} isoDate={LAST_UPDATED_ISO} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <EanGenerator />
        </div>
        <aside className="lg:w-[300px] flex justify-center lg:justify-start">
          <AdSlot slot="ean-sidebar" format="rectangle" />
        </aside>
      </div>

      {/* Como usar */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Como gerar código EAN</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Escolha EAN-13 ou EAN-8', desc: 'EAN-13 tem 13 dígitos e é o padrão para a maioria dos produtos. EAN-8 tem 8 dígitos e é usado em embalagens pequenas.' },
            { step: '2', title: 'Digite o número', desc: 'Informe todos os dígitos do código, incluindo o dígito verificador (último dígito). O sistema valida automaticamente.' },
            { step: '3', title: 'Baixe em PNG, SVG ou PDF', desc: 'Faça download imediato para usar em embalagens, etiquetas ou sistemas de PDV.' },
          ].map(({ step, title, desc }) => (
            <article key={step} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold text-lg flex items-center justify-center mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* O que é */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">O que é o código EAN?</h2>
        <div className="text-gray-600 space-y-4">
          <p>O <strong>EAN (European Article Number)</strong> é o sistema de codificação de produtos mais usado no mundo. No Brasil, é administrado pela <a href="https://www.gs1br.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800"><strong>GS1 Brasil</strong></a> e presente em praticamente todos os produtos vendidos no varejo.</p>
          <p>O <strong>EAN-13</strong> possui 13 dígitos: os três primeiros identificam o país (789 ou 790 para o Brasil), os próximos identificam o fabricante, depois o produto, e o último é o dígito verificador calculado automaticamente.</p>
          <p>O <strong>EAN-8</strong> é uma versão abreviada para embalagens com pouco espaço. Segue a mesma lógica, mas com apenas 8 dígitos.</p>
          <p><strong>Atenção:</strong> para comercializar produtos em redes varejistas (supermercados, farmácias etc.), os códigos EAN precisam ser <a href="https://www.gs1br.org/codigos-e-padroes/codigo-de-barras" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">registrados oficialmente na GS1 Brasil</a>, que atribui um prefixo exclusivo à sua empresa.</p>
        </div>
      </section>

      {/* GTIN */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">EAN e GTIN: qual a relação?</h2>
        <div className="text-gray-600 space-y-4">
          <p>O código EAN faz parte do sistema <strong>GTIN (Global Trade Item Number)</strong>, o identificador numérico global de produtos mantido pela <a href="https://www.gs1br.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">GS1</a>. Na prática:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>GTIN-13:</strong> EAN-13 (13 dígitos), usado na maioria dos produtos de consumo no Brasil e no mundo.</li>
            <li><strong>GTIN-8:</strong> EAN-8 (8 dígitos), para embalagens pequenas.</li>
            <li><strong>GTIN-12:</strong> UPC-A (12 dígitos), padrão norte-americano, necessário para exportar para os EUA.</li>
            <li><strong>GTIN-14:</strong> ITF-14 (14 dígitos), para caixas de transporte e logística.</li>
          </ul>
          <p className="text-sm">Quando um marketplace como Mercado Livre, Amazon ou Shopee pede o &quot;GTIN&quot; do produto, eles estão pedindo o código EAN-13. O GeraCode gera o código visual a partir desse número.</p>
        </div>
      </section>

      {/* Estrutura do EAN-13 */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Estrutura do Código EAN-13</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Prefixo do país (3 dígitos)', desc: 'Os três primeiros dígitos identificam o país de origem. Para o Brasil, os prefixos são 789 e 790, atribuídos pela GS1 Global.' },
            { title: 'Código do fabricante (4-7 dígitos)', desc: 'Identifica a empresa fabricante ou importadora. O número de dígitos varia conforme o plano contratado na GS1 Brasil.' },
            { title: 'Código do produto (2-5 dígitos)', desc: 'Identificador único do produto dentro do catálogo da empresa. Definido pelo próprio fabricante.' },
            { title: 'Dígito verificador (1 dígito)', desc: 'O último dígito é calculado pelo algoritmo de módulo 10, garantindo a integridade do código. Nosso gerador valida automaticamente.' },
          ].map(({ title, desc }) => (
            <article key={title} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-16">
        <AdSlot slot="ean-mid" format="responsive" />
      </div>

      {/* Dígito verificador */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Como funciona o dígito verificador</h2>
        <div className="text-gray-600 space-y-4">
          <p>O último dígito do EAN-13 é calculado automaticamente pelo <strong>algoritmo de módulo 10</strong>, que garante a integridade do código contra erros de digitação. O processo:</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Some os dígitos em posições <strong>ímpares</strong> (1.º, 3.º, 5.º…).</li>
            <li>Some os dígitos em posições <strong>pares</strong> (2.º, 4.º, 6.º…) e multiplique por <strong>3</strong>.</li>
            <li>Some os dois resultados.</li>
            <li>O dígito verificador é o número que, somado ao total, resulta no <strong>múltiplo de 10 mais próximo</strong>.</li>
          </ol>
          <p className="text-sm">Nosso gerador calcula e valida o dígito verificador automaticamente. Basta digitar 12 dígitos para EAN-13 ou 7 para EAN-8.</p>
        </div>
      </section>

      {/* Onde usar EAN */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Onde Usar o Código EAN</h2>
        <div className="prose prose-gray max-w-none text-gray-600">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Supermercados e varejo:</strong> O EAN-13 é o padrão para leitura nos caixas (PDV) de redes varejistas em todo o Brasil.</li>
            <li><strong>E-commerce e marketplaces:</strong> Mercado Livre, Amazon, Shopee e outros marketplaces usam o EAN para identificação de produtos.</li>
            <li><strong>Controle de estoque:</strong> Facilita a gestão de inventário com leitores de código de barras portáteis.</li>
            <li><strong>Logística e distribuição:</strong> Permite rastreamento de produtos ao longo da cadeia de suprimentos.</li>
            <li><strong>Indústria farmacêutica:</strong> Códigos EAN são obrigatórios para medicamentos e produtos de saúde no Brasil.</li>
            <li><strong>Exportação:</strong> O padrão EAN é reconhecido internacionalmente em mais de 100 países.</li>
          </ul>
        </div>
      </section>

      {/* Prefixos do Brasil */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Prefixos EAN do Brasil</h2>
        <div className="text-gray-600 space-y-4">
          <p>
            O Brasil possui dois prefixos de país atribuídos pela GS1 Global: <strong>789</strong> e <strong>790</strong>. Todo produto brasileiro registrado na GS1 Brasil terá seu código EAN-13 começando com um desses prefixos.
          </p>
          <p className="text-sm">
            Exemplos de prefixos de outros países: EUA e Canadá (000-019), França (300-379), Alemanha (400-440), Japão (450-459), China (690-695), Argentina (779).
          </p>
        </div>
      </section>

      <FAQSection items={faqs} />

      <div className="flex justify-center mt-8">
        <AdSlot slot="ean-bottom" format="horizontal" />
      </div>

      <RelatedTools currentPath="/gerador-de-ean" />
    </div>
  )
}
