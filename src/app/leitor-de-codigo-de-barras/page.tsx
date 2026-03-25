import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import FAQSection from '@/components/FAQSection'
import AdSlot from '@/components/AdSlot'
import SchemaMarkup from '@/components/SchemaMarkup'
import RelatedTools from '@/components/RelatedTools'
import Breadcrumb from '@/components/Breadcrumb'
import LastUpdated from '@/components/LastUpdated'
import GeneratorSkeleton from '@/components/GeneratorSkeleton'
import { LAST_UPDATED } from '@/lib/constants'

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
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    about: { '@type': 'Thing', name: 'Leitor de código de barras' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Leitor de Código de Barras', item: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras' },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Leitor de Código de Barras Online Grátis | Leia pela Câmera',
  description: 'Leitor de código de barras online grátis. Use a câmera do celular ou computador para ler EAN-13, Code 128, QR Code e mais. Sem instalar aplicativo, 100% no navegador.',
  alternates: {
    canonical: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras',
  },
  openGraph: {
    title: 'Leitor de Código de Barras Online Grátis | GeraCode',
    description: 'Leia códigos de barras e QR Codes pela câmera do celular. Sem app, sem cadastro, 100% gratuito.',
    url: 'https://www.geracodigo.com.br/leitor-de-codigo-de-barras',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'GeraCode',
    images: [{ url: '/leitor-de-codigo-de-barras/opengraph-image', width: 1200, height: 630, alt: 'Leitor de Código de Barras Online | GeraCode' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leitor de Código de Barras Online | GeraCode',
    description: 'Leia códigos pela câmera. Sem app, sem cadastro.',
    images: ['/leitor-de-codigo-de-barras/opengraph-image'],
  },
}

export default function BarcodeReaderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot="reader-top" format="horizontal" />
      </div>
      <Breadcrumb current="Leitor de Código de Barras" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leitor de Código de Barras Online Grátis</h1>
        <p className="text-gray-600">Use a câmera do celular ou computador para ler códigos de barras e QR Codes. Sem instalar nada</p>
        <p className="text-sm text-indigo-600 mt-1">Tudo processado no seu navegador. Nenhum dado é enviado para servidores</p>
        <LastUpdated date={LAST_UPDATED} />
      </div>

      <BarcodeReader />

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

      <FAQSection items={[
        { question: 'Preciso instalar algum aplicativo?', answer: 'Não. O leitor funciona diretamente no navegador do seu celular ou computador. Basta acessar a página, permitir o acesso à câmera e apontar para o código.' },
        { question: 'Quais navegadores são compatíveis?', answer: 'O leitor usa a API BarcodeDetector, disponível no Chrome 83+, Edge 83+ e Opera 69+. No Safari e Firefox, a API ainda não é suportada nativamente, mas você pode digitar o código manualmente.' },
        { question: 'Meus dados de leitura ficam salvos?', answer: 'Não. Toda a leitura acontece localmente no seu navegador. Nenhuma imagem da câmera ou código lido é enviado para servidores. Os resultados existem apenas durante a sessão.' },
        { question: 'Funciona com a câmera frontal?', answer: 'Sim, mas a câmera traseira é preferível por ter melhor foco e resolução. Em computadores, a webcam integrada funciona normalmente.' },
        { question: 'Posso ler QR Codes também?', answer: 'Sim. O leitor detecta automaticamente tanto códigos de barras lineares (EAN-13, Code 128, etc.) quanto QR Codes.' },
      ]} />

      <div className="flex justify-center mt-8">
        <AdSlot slot="reader-bottom" format="horizontal" />
      </div>

      <RelatedTools currentPath="/leitor-de-codigo-de-barras" />
    </div>
  )
}
