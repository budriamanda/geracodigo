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

const BarcodeReader = dynamic(() => import('./BarcodeReader'), {
  loading: () => <GeneratorSkeleton />,
})

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Leitor de Código de Barras Online',
    description: 'Leia códigos de barras e QR Codes usando a câmera do seu dispositivo. Suporta EAN-13, Code 128, QR Code e mais. Gratuito, sem instalar nada.',
    url: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    author: { '@id': 'https://www.geracodigo.com.br/#organization' },
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    featureList: [
      'Leitura via câmera', 'EAN-13', 'EAN-8', 'Code 128', 'Code 39', 'Code 93',
      'UPC-A', 'UPC-E', 'ITF', 'Codabar', 'QR Code', 'Detecção automática',
      '100% client-side', 'Sem instalação',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como ler código de barras pelo celular sem aplicativo',
    description: 'Use a câmera do celular para ler códigos de barras diretamente no navegador, sem instalar nenhum app.',
    totalTime: 'PT1M',
    inLanguage: 'pt-BR',
    tool: { '@type': 'HowToTool', name: 'GeraCode: Leitor de Código de Barras' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Abra o leitor', text: 'Acesse o leitor de código de barras do GeraCode no navegador do celular ou computador.' },
      { '@type': 'HowToStep', position: 2, name: 'Permita acesso à câmera', text: 'Clique em "Iniciar Câmera" e permita o acesso quando solicitado pelo navegador.' },
      { '@type': 'HowToStep', position: 3, name: 'Aponte para o código', text: 'Posicione o código de barras ou QR Code na frente da câmera. A leitura é automática.' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Leitor de Código de Barras Online Grátis',
    description: 'Leia códigos de barras e QR Codes usando a câmera do seu dispositivo. Suporta EAN-13, Code 128, QR Code e mais. Gratuito, sem instalar nada.',
    url: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras',
    inLanguage: 'pt-BR',
    datePublished: '2026-02-10',
    dateModified: '2026-03-27',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    about: { '@type': 'Thing', name: 'Leitor de código de barras' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Leitor de Código de Barras', item: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras' },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const tool = await reader.collections.ferramentas.read('leitor-de-codigo-de-barras')
  return {
    title: tool?.title ?? 'Leitor de Código de Barras Online Grátis',
    description: tool?.metaDescription ?? 'Leitor de código de barras online grátis. Use a câmera do celular ou computador para ler EAN-13, Code 128, QR Code e mais. Sem instalar aplicativo, 100% no navegador.',
    alternates: { canonical: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras' },
    openGraph: {
      title: tool?.ogTitle ?? 'Leitor de Código de Barras Online Grátis | GeraCode',
      description: tool?.ogDescription ?? 'Leia códigos de barras e QR Codes pela câmera do celular. Sem app, sem cadastro, 100% gratuito.',
      url: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras',
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: '/leitor-de-codigo-de-barras/opengraph-image', width: 1200, height: 630, alt: 'Leitor de Código de Barras Online | GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool?.twitterTitle ?? 'Leitor de Código de Barras Online | GeraCode',
      description: tool?.twitterDescription ?? 'Leia códigos pela câmera. Sem app, sem cadastro.',
      images: ['/leitor-de-codigo-de-barras/opengraph-image'],
    },
  }
}

export default async function BarcodeReaderPage() {
  const [tool, faqsAll] = await Promise.all([
    reader.collections.ferramentas.read('leitor-de-codigo-de-barras'),
    reader.collections.faqs.all(),
  ])
  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'leitor')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot="reader-top" format="horizontal" />
      </div>
      <Breadcrumb current="Leitor de Código de Barras" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool?.h1 ?? 'Leitor de Código de Barras Online Grátis'}</h1>
        <p className="text-gray-600">{tool?.subtitle ?? 'Use a câmera do celular ou computador para ler códigos de barras e QR Codes. Sem instalar nada'}</p>
        <p className="text-sm text-indigo-600 mt-1">Tudo processado no seu navegador. Nenhum dado é enviado para servidores</p>
        <LastUpdated date={LAST_UPDATED} isoDate={LAST_UPDATED_ISO} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <BarcodeReader />
        </div>
        <aside className="lg:w-[300px] flex justify-center lg:justify-start">
          <AdSlot slot="reader-sidebar" format="rectangle" />
        </aside>
      </div>

      {/* Como funciona */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Como usar o leitor de código de barras</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Inicie a câmera', desc: 'Clique em "Iniciar Câmera" e permita o acesso quando o navegador solicitar. A câmera traseira é usada automaticamente em celulares.' },
            { step: '2', title: 'Aponte para o código', desc: 'Posicione o código de barras ou QR Code na frente da câmera, mantendo uma distância de 10-20cm. A detecção é automática.' },
            { step: '3', title: 'Copie o resultado', desc: 'O valor decodificado aparece na lista. Clique em "Copiar" para usar o código em outras aplicações.' },
          ].map(({ step, title, desc }) => (
            <article key={step} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg flex items-center justify-center mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-16">
        <AdSlot slot="reader-mid" format="responsive" />
      </div>

      {/* Formatos suportados */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Formatos suportados pelo leitor</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['EAN-13', 'EAN-8', 'Code 128', 'Code 39', 'Code 93', 'UPC-A', 'UPC-E', 'ITF', 'Codabar', 'QR Code'].map(f => (
            <div key={f} className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 text-center font-medium">{f}</div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          O leitor utiliza a API BarcodeDetector nativa do navegador, disponível no Chrome 83+, Edge 83+ e Opera 69+. Para navegadores sem suporte, utilize a entrada manual.
        </p>
      </section>

      {/* Casos de uso */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quando usar o leitor de código de barras online</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Conferência de estoque', desc: 'Escaneie produtos rapidamente para verificar códigos e quantidades sem precisar de um leitor físico dedicado.' },
            { title: 'Verificação de etiquetas', desc: 'Após imprimir etiquetas com código de barras, use o leitor para confirmar que os códigos estão corretos e legíveis.' },
            { title: 'Cadastro de produtos', desc: 'Leia o código de barras de um produto e copie o valor para cadastrar em planilhas, ERPs ou plataformas de e-commerce.' },
            { title: 'Comparação de preços', desc: 'Escaneie produtos para identificar o código e buscar informações de preço em diferentes fornecedores.' },
          ].map(({ title, desc }) => (
            <article key={title} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <FAQSection items={faqs} />

      <div className="flex justify-center mt-8">
        <AdSlot slot="reader-bottom" format="horizontal" />
      </div>

      <RelatedTools currentPath="/leitor-de-codigo-de-barras" />
    </div>
  )
}
