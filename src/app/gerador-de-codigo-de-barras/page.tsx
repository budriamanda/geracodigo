import type { Metadata } from 'next'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import AdSlot from '@/components/AdSlot'
import FAQSection from '@/components/FAQSection'
import SchemaMarkup from '@/components/SchemaMarkup'
import RelatedTools from '@/components/RelatedTools'
import Breadcrumb from '@/components/Breadcrumb'
import LastUpdated from '@/components/LastUpdated'
import GeneratorSkeleton from '@/components/GeneratorSkeleton'
import { LAST_UPDATED, LAST_UPDATED_ISO } from '@/lib/constants'
import { reader } from '@/lib/content'

const BarcodeGenerator = dynamic(() => import('./BarcodeGenerator'), {
  loading: () => <GeneratorSkeleton />,
})

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Gerador de Código de Barras',
    description: 'Gere códigos EAN-13, EAN-8, Code 128, Code 39, Code 93, UPC-A, ITF-14, Codabar, MSI, Pharmacode e ISBN direto no navegador. Geração em lote, download PNG, SVG e PDF. Sem cadastro.',
    url: 'https://www.geracodigo.com.br/gerador-de-codigo-de-barras',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    author: { '@id': 'https://www.geracodigo.com.br/#organization' },
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    featureList: [
      'EAN-13', 'EAN-8', 'Code 128', 'Code 39', 'Code 93', 'UPC-A', 'UPC-E',
      'ITF-14', 'MSI Plessey', 'Codabar', 'Pharmacode', 'ISBN',
      'Geração em lote', 'Download PNG, SVG e PDF', 'Impressão de etiquetas',
      'Cálculo automático do dígito verificador', 'Histórico local',
      'Personalização de cores, altura e largura', '100% client-side',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como gerar código de barras para produtos',
    description: 'Passo a passo para criar código de barras EAN-13, Code 128 e outros formatos com personalização e download em múltiplos formatos.',
    totalTime: 'PT2M',
    inLanguage: 'pt-BR',
    tool: { '@type': 'HowToTool', name: 'GeraCode: Gerador de Código de Barras' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Escolha o formato', text: 'Selecione entre 12 formatos: EAN-13, Code 128, Code 93, UPC-A, ITF-14, Codabar e mais. Personalize altura, largura e cores.' },
      { '@type': 'HowToStep', position: 2, name: 'Digite o valor', text: 'Insira o número ou texto. Para EAN-13, digite 12 dígitos e o verificador será calculado automaticamente.' },
      { '@type': 'HowToStep', position: 3, name: 'Baixe ou imprima', text: 'Download em PNG, SVG ou PDF. Use o modo lote para gerar múltiplos códigos e baixe tudo em ZIP.' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gerador de Código de Barras Grátis Online',
    description: 'Gere códigos de barras em 12 formatos: Code 128, Code 39, UPC-A, ITF-14, Codabar e mais. Download PNG, SVG e PDF. Sem cadastro.',
    url: 'https://www.geracodigo.com.br/gerador-de-codigo-de-barras',
    inLanguage: 'pt-BR',
    datePublished: '2026-01-15',
    dateModified: '2026-03-27',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    about: { '@type': 'Thing', name: 'Código de barras' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Gerador de Código de Barras', item: 'https://www.geracodigo.com.br/gerador-de-codigo-de-barras' },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const tool = await reader.collections.ferramentas.read('gerador-de-codigo-de-barras')
  return {
    title: tool?.title ?? 'Gerador de Código de Barras Grátis | 12 Formatos',
    description: tool?.metaDescription ?? 'Gerador grátis de código de barras com 12 formatos: EAN-13, Code 128, Code 93, UPC-A, ITF-14, Codabar, MSI e mais. Geração em lote, download PNG, SVG e PDF, impressão de etiquetas. Sem cadastro, 100% privado.',
    alternates: {
      canonical: 'https://www.geracodigo.com.br/gerador-de-codigo-de-barras',
    },
    openGraph: {
      title: tool?.ogTitle ?? 'Gerador de Código de Barras Grátis | 12+ Formatos | GeraCode',
      description: tool?.ogDescription ?? 'Gerador grátis com EAN-13, Code 128, Code 93, UPC-A, ITF-14, Codabar e mais. Lote, PDF, etiquetas. Sem cadastro.',
      url: 'https://www.geracodigo.com.br/gerador-de-codigo-de-barras',
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: '/gerador-de-codigo-de-barras/opengraph-image', width: 1200, height: 630, alt: 'Gerador de Código de Barras Grátis | GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool?.twitterTitle ?? 'Gerador de Código de Barras Grátis | GeraCode',
      description: tool?.twitterDescription ?? '12+ formatos, geração em lote, PDF, etiquetas. Sem cadastro.',
      images: ['/gerador-de-codigo-de-barras/opengraph-image'],
    },
  }
}

export default async function BarcodePage() {
  const [tool, faqsAll] = await Promise.all([
    reader.collections.ferramentas.read('gerador-de-codigo-de-barras'),
    reader.collections.faqs.all(),
  ])
  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'codigo-de-barras')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot="barcode-top" format="horizontal" />
      </div>

      <Breadcrumb current="Gerador de Código de Barras" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool?.h1 ?? 'Gerador de Código de Barras Grátis Online'}</h1>
        <p className="text-gray-600">{tool?.subtitle ?? '12 formatos: EAN-13, Code 128, Code 93, UPC-A, ITF-14, Codabar e mais. Geração em lote, PDF e impressão de etiquetas'}</p>
        <p className="text-sm text-indigo-600 mt-1">Gerado direto no seu navegador. Seus dados nunca saem do seu computador</p>
        <LastUpdated date={LAST_UPDATED} isoDate={LAST_UPDATED_ISO} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <BarcodeGenerator />
        </div>
        <aside className="lg:w-[300px] flex justify-center lg:justify-start">
          <AdSlot slot="barcode-sidebar" format="rectangle" />
        </aside>
      </div>

      <div className="flex justify-center mt-8">
        <AdSlot slot="barcode-bottom" format="horizontal" />
      </div>

      {/* Funcionalidades */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Funcionalidades exclusivas do GeraCode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Geração em Lote', desc: 'Gere dezenas de códigos de uma vez. Cole do Excel ou digite um por linha. Baixe tudo em ZIP ou PDF com um clique.' },
            { title: 'Cálculo do Dígito Verificador', desc: 'Para EAN-13, digite apenas 12 dígitos e o 13.º será calculado automaticamente. Funciona também para EAN-8.' },
            { title: 'Personalização Completa', desc: 'Ajuste altura, largura da barra, cores, fonte e visibilidade do texto. Crie códigos que combinam com sua identidade visual.' },
            { title: 'Impressão de Etiquetas', desc: 'Imprima etiquetas diretamente do navegador em layouts 2x5 ou 3x5. Ideal para etiquetar produtos rapidamente.' },
            { title: 'Download em 3 Formatos', desc: 'PNG para uso digital, SVG para impressão profissional e PDF para documentos. Tudo gratuito e sem marca d\'água.' },
            { title: 'Histórico Local', desc: 'Seus códigos gerados ficam salvos no navegador para reúso rápido. Nenhum dado sai do seu dispositivo.' },
          ].map(({ title, desc }) => (
            <article key={title} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Como usar */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Como gerar código de barras</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Escolha o formato e personalize', desc: 'Selecione entre 12 formatos de código de barras. Ajuste altura, largura, cores e fonte para atender suas necessidades.' },
            { step: '2', title: 'Digite o valor ou cole uma lista', desc: 'No modo individual, digite o valor. No modo lote, cole uma lista do Excel com um código por linha. O dígito verificador EAN é calculado automaticamente.' },
            { step: '3', title: 'Baixe, imprima ou exporte', desc: 'Download em PNG, SVG ou PDF. Use o ZIP para lotes. Imprima etiquetas diretamente com layouts pré-formatados.' },
          ].map(({ step, title, desc }) => (
            <article key={step} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-16">
        <AdSlot slot="barcode-mid" format="responsive" />
      </div>

      {/* Formatos */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12 formatos de código de barras suportados</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          {[
            { name: 'Code 128', desc: 'Alta densidade, suporta letras, números e caracteres especiais. Usado em logística, etiquetas de envio e controle de estoque.' },
            { name: 'Code 39', desc: 'Formato amplamente suportado. Usado em identificação de ativos, crachás e ambientes industriais.' },
            { name: 'Code 93', desc: 'Evolução do Code 39 com maior densidade de dados. Usado em logística e Canada Post.' },
            { name: 'UPC-A', desc: 'Padrão norte-americano com 12 dígitos. Necessário para vender no mercado dos EUA.' },
            { name: 'UPC-E', desc: 'Versão compacta do UPC-A para embalagens pequenas. 8 dígitos.' },
            { name: 'ITF-14', desc: 'Usado em caixas de transporte e embalagens de nível logístico. 14 dígitos. Padrão GS1.' },
            { name: 'MSI Plessey', desc: 'Usado em controle de estoque e prateleiras de supermercado. Apenas números.' },
            { name: 'Codabar', desc: 'Usado em bibliotecas, bancos de sangue e serviços de entrega (FedEx). Formato auto-verificável.' },
            { name: 'Pharmacode', desc: 'Código específico para a indústria farmacêutica. Codifica números de 3 a 131070.' },
            { name: 'ISBN', desc: 'Identificação internacional de livros. Baseado no EAN-13 com prefixo 978/979.' },
          ].map(({ name, desc }) => (
            <div key={name}>
              <dt className="font-semibold text-gray-900 mb-1">{name}</dt>
              <dd className="text-sm">{desc}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>EAN-13 e EAN-8</strong>: padrões internacionais para produtos de consumo (GTIN), administrados pela GS1.
            Para detalhes sobre estrutura, dígito verificador, prefixos brasileiros e registro, consulte nosso{' '}
            <Link href="/gerador-de-ean" className="text-indigo-600 underline hover:text-indigo-800 font-medium">Gerador de EAN-13 e EAN-8</Link>.
          </p>
        </div>
      </section>

      {/* GS1 e registro */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Código de Barras e GS1 Brasil</h2>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
          <p>
            Para comercializar produtos em <strong>grandes redes varejistas</strong> (supermercados, farmácias, magazines), os códigos EAN devem ser registrados na{' '}
            <a href="https://www.gs1br.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800"><strong>GS1 Brasil</strong></a>,
            a entidade oficial responsável pela atribuição de prefixos de fabricante.
          </p>
          <p>Para diversas situações o GeraCode é a ferramenta ideal, dispensando registro na GS1:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>E-commerce próprio:</strong> Lojas virtuais com sistemas próprios de controle de estoque.</li>
            <li><strong>Controle interno:</strong> Identificação de ativos, ferramentas, equipamentos e materiais.</li>
            <li><strong>Testes e protótipos:</strong> Validação de layouts de embalagens e etiquetas.</li>
            <li><strong>Logística interna:</strong> Rastreamento de volumes e caixas com Code 128 ou ITF-14.</li>
            <li><strong>Uso educacional:</strong> Demonstrações, treinamentos e materiais didáticos.</li>
          </ul>
        </div>
      </section>

      {/* Dicas de impressao */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dicas para Impressão de Códigos de Barras</h2>
        <div className="prose prose-gray max-w-none text-gray-600">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Tamanho mínimo:</strong> O tamanho mínimo recomendado para EAN-13 é 25,93 x 21,31 mm. Códigos muito pequenos podem não ser lidos por scanners.</li>
            <li><strong>Contraste:</strong> Use barras escuras sobre fundo claro. Preto sobre branco oferece o melhor contraste.</li>
            <li><strong>Zonas de silêncio:</strong> Mantenha uma área em branco de pelo menos 5mm antes e depois do código.</li>
            <li><strong>Resolução:</strong> Para impressão profissional, use SVG (vetorial) ou PNG com pelo menos 300 DPI.</li>
            <li><strong>Teste de leitura:</strong> Sempre teste o código impresso com um leitor antes de produzir em escala.</li>
            <li><strong>Etiquetas:</strong> Use a função de impressão de etiquetas do GeraCode para layouts prontos em A4.</li>
          </ul>
        </div>
      </section>

      <FAQSection items={faqs} />

      <RelatedTools currentPath="/gerador-de-codigo-de-barras" />
    </div>
  )
}
