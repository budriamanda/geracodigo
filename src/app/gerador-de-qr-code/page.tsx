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

const QrGenerator = dynamic(() => import('./QrGenerator'), {
  loading: () => <GeneratorSkeleton />,
})

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Gerador de QR Code',
    description: 'Gere QR Code para links, textos e qualquer conteúdo. Color picker, seletor de tamanho, download PNG e SVG. Gratuito, sem cadastro.',
    url: 'https://www.geracodigo.com.br/gerador-de-qr-code',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    author: { '@id': 'https://www.geracodigo.com.br/#organization' },
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    featureList: ['QR Code para links e textos', 'Color picker', 'Seletor de tamanho (200–500px)', 'Download PNG e SVG', 'Preview em tempo real', '100% client-side'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como gerar QR Code para link ou texto',
    description: 'Passo a passo para criar QR Code personalizado para qualquer conteúdo.',
    totalTime: 'PT1M',
    inLanguage: 'pt-BR',
    tool: { '@type': 'HowToTool', name: 'GeraCode: Gerador de QR Code' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Digite o conteúdo', text: 'Cole um link, escreva um texto, número de telefone, e-mail ou qualquer informação.', url: 'https://www.geracodigo.com.br/gerador-de-qr-code#passo-1' },
      { '@type': 'HowToStep', position: 2, name: 'Personalize', text: 'Escolha o tamanho e as cores para combinar com sua identidade visual.', url: 'https://www.geracodigo.com.br/gerador-de-qr-code#passo-2' },
      { '@type': 'HowToStep', position: 3, name: 'Baixe e use', text: 'Faça download em PNG para uso digital ou SVG para impressão profissional.', url: 'https://www.geracodigo.com.br/gerador-de-qr-code#passo-3' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gerador de QR Code Grátis Online',
    description: 'Gere QR Code para links, textos e qualquer conteúdo. Color picker, seletor de tamanho, download PNG e SVG. Gratuito, sem cadastro.',
    url: 'https://www.geracodigo.com.br/gerador-de-qr-code',
    inLanguage: 'pt-BR',
    datePublished: '2026-01-15',
    dateModified: '2026-03-01',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    about: { '@type': 'Thing', name: 'QR Code' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Gerador de QR Code', item: 'https://www.geracodigo.com.br/gerador-de-qr-code' },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const tool = await reader.collections.ferramentas.read('gerador-de-qr-code')
  return {
    title: tool?.title ?? 'Gerador de QR Code Grátis Online',
    description: tool?.metaDescription ?? 'Gere QR Code grátis para links, textos e qualquer conteúdo. Color picker, download PNG e SVG. Sem cadastro, 100% privado.',
    alternates: { canonical: 'https://www.geracodigo.com.br/gerador-de-qr-code' },
    openGraph: {
      title: tool?.ogTitle ?? 'Gerador de QR Code Grátis Online | GeraCode',
      description: tool?.ogDescription ?? 'Gere QR Code para links, textos e qualquer conteúdo. Color picker, download PNG e SVG. Sem cadastro.',
      url: 'https://www.geracodigo.com.br/gerador-de-qr-code',
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: '/gerador-de-qr-code/opengraph-image', width: 1200, height: 630, alt: 'Gerador de QR Code Grátis | GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool?.twitterTitle ?? 'Gerador de QR Code Grátis | GeraCode',
      description: tool?.twitterDescription ?? 'Links, textos e qualquer conteúdo. Color picker incluso. Download PNG e SVG. Sem cadastro.',
      images: ['/gerador-de-qr-code/opengraph-image'],
    },
  }
}

export default async function QrPage() {
  const [tool, faqsAll] = await Promise.all([
    reader.collections.ferramentas.read('gerador-de-qr-code'),
    reader.collections.faqs.all(),
  ])
  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'qr-code')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot="qr-top" format="horizontal" />
      </div>
      <Breadcrumb current="Gerador de QR Code" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool?.h1 ?? 'Gerador de QR Code Grátis Online'}</h1>
        <p className="text-gray-600">{tool?.subtitle ?? 'Gere QR Code para links, textos e qualquer conteúdo. Gratuito, sem cadastro.'}</p>
        <p className="text-sm text-indigo-600 mt-1"><span aria-hidden="true">{'\u{1F512}'}</span> Gerado direto no seu navegador. Seus dados nunca saem do seu computador</p>
        <LastUpdated date={LAST_UPDATED} isoDate={LAST_UPDATED_ISO} />
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <QrGenerator />
        </div>
        <aside className="lg:w-[300px] flex justify-center lg:justify-start">
          <AdSlot slot="qr-sidebar" format="rectangle" />
        </aside>
      </div>

      {/* Como usar */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Como gerar seu QR Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Digite o conteúdo', desc: 'Cole um link, escreva um texto, número de telefone, e-mail ou qualquer informação que queira codificar no QR Code.' },
            { step: '2', title: 'Personalize', desc: 'Escolha o tamanho do QR Code e as cores (escura e de fundo) para combinar com a identidade visual do seu negócio.' },
            { step: '3', title: 'Baixe e use', desc: 'Faça download em PNG para uso digital ou SVG para impressão profissional em alta qualidade.' },
          ].map(({ step, title, desc }) => (
            <article key={step} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold text-lg flex items-center justify-center mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* O que é */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Para que serve o QR Code?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
          {[
            { title: 'Links e sites', desc: 'Direcione clientes para seu site, cardápio digital, página de produto ou rede social.' },
            { title: 'Pagamento Pix', desc: 'Para QR Code Pix com payload válido, use nossa ferramenta dedicada em /gerador-de-qr-code-pix.' },
            { title: 'Cardápios digitais', desc: 'Restaurantes e lanchonetes usam QR Code para substituir cardápios físicos e reduzir custos.' },
            { title: 'Redes sociais e contato', desc: 'Codifique seu WhatsApp, Instagram ou LinkedIn para que clientes adicionem seu contato com um escaneamento.' },
            { title: 'Wi-Fi', desc: 'Compartilhe a senha do Wi-Fi do seu estabelecimento sem precisar digitá-la manualmente.' },
            { title: 'Embalagens e etiquetas', desc: 'Adicione informações extras ao produto sem ocupar espaço na embalagem.' },
          ].map(({ title, desc }) => (
            <article key={title}>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-16">
        <AdSlot slot="qr-mid" format="responsive" />
      </div>

      {/* Tipos de conteúdo */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Conteúdo para QR Code</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'URLs e links', desc: 'Direcione para sites, landing pages, formulários de contato, páginas de produto, cardápios digitais ou qualquer endereço na web.' },
            { title: 'WhatsApp', desc: 'Use o formato wa.me/5511999999999 para que clientes iniciem uma conversa com você no WhatsApp com um simples escaneamento.' },
            { title: 'Wi-Fi', desc: 'Compartilhe a senha do Wi-Fi do seu estabelecimento. Use o formato: WIFI:T:WPA;S:NomeDaRede;P:SenhaAqui;; para conexão automática.' },
            { title: 'Texto livre', desc: 'Codifique qualquer texto, mensagem, instrução ou informação que caiba em um QR Code (até ~4.296 caracteres alfanuméricos).' },
            { title: 'E-mail', desc: 'Use o formato mailto:email@exemplo.com para que o escaneamento abra o app de e-mail com o destinatário já preenchido.' },
            { title: 'Localização', desc: 'Compartilhe coordenadas geográficas usando o formato geo:latitude,longitude para abrir diretamente no app de mapas.' },
          ].map(({ title, desc }) => (
            <article key={title} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Dicas de uso */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Boas Práticas para QR Codes</h2>
        <div className="prose prose-gray max-w-none text-gray-600">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Mantenha o contraste:</strong> QR Codes precisam de bom contraste entre os módulos (quadradinhos) e o fundo. Cor escura sobre fundo claro é o mais seguro.</li>
            <li><strong>Tamanho mínimo para impressão:</strong> Pelo menos 2 x 2 cm para leitura confiável em smartphones. Para distâncias maiores (cartazes, banners), aumente proporcionalmente.</li>
            <li><strong>Teste antes de imprimir:</strong> Sempre escaneie o QR Code com pelo menos 2 aplicativos diferentes para garantir que funciona corretamente.</li>
            <li><strong>URLs curtas:</strong> Links mais curtos geram QR Codes com menos módulos, que são mais fáceis de escanear. Use encurtadores de URL quando necessário.</li>
            <li><strong>Use SVG para impressão profissional:</strong> O formato SVG é vetorial e não perde qualidade ao ampliar, ideal para adesivos, cartões de visita e materiais gráficos.</li>
          </ul>
        </div>
      </section>

      {/* QR Code vs Código de Barras */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Code vs Código de Barras: Qual Escolher?</h2>
        <div className="text-gray-600 space-y-4">
          <p>
            O <strong>código de barras tradicional</strong> (como EAN-13) armazena apenas dados numéricos de forma linear, sendo ideal para identificação de produtos no ponto de venda. Já o <strong>QR Code</strong> é bidimensional e armazena muito mais informação: links, textos, contatos, Wi-Fi e mais.
          </p>
          <p>
            Use <strong>código de barras</strong> para: etiquetas de produtos, controle de estoque, sistemas de PDV e logística. Use <strong>QR Code</strong> para: marketing digital, pagamentos Pix, cardápios, compartilhamento de informações e engajamento do cliente.
          </p>
          <p className="text-sm">
            O GeraCode oferece ambas as ferramentas gratuitamente. Acesse o <Link href="/gerador-de-codigo-de-barras" className="text-indigo-600 hover:underline">Gerador de Código de Barras</Link> para criar códigos EAN-13, Code 128 e mais.
          </p>
        </div>
      </section>

      <FAQSection items={faqs} />

      <div className="flex justify-center mt-8">
        <AdSlot slot="qr-bottom" format="horizontal" />
      </div>

      <RelatedTools currentPath="/gerador-de-qr-code" />
    </div>
  )
}
