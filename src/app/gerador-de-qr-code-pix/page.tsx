import type { Metadata } from 'next'
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

const PixGenerator = dynamic(() => import('./PixGenerator'), {
  loading: () => <GeneratorSkeleton />,
})

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: 'Gerador de QR Code Pix',
    description: 'Gere QR Code para pagamento via Pix com chave CPF, CNPJ, e-mail ou aleatória. Payload BR Code EMV válido, gerado no navegador sem cadastro.',
    url: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    author: { '@id': 'https://www.geracodigo.com.br/#organization' },
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    featureList: ['QR Code Pix estático', 'Payload BR Code EMV', 'CPF, CNPJ, e-mail, telefone, chave aleatória', 'Download PNG e SVG', 'Preview em tempo real', '100% client-side'],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como gerar QR Code Pix para cobranças',
    description: 'Passo a passo para criar um QR Code Pix estático válido com payload BR Code.',
    totalTime: 'PT2M',
    inLanguage: 'pt-BR',
    tool: { '@type': 'HowToTool', name: 'GeraCode: Gerador de QR Code Pix' },
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Informe sua chave Pix', text: 'Selecione o tipo de chave (CPF, CNPJ, e-mail, telefone ou aleatória) e insira o valor da chave cadastrada no seu banco.', url: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix#passo-1' },
      { '@type': 'HowToStep', position: 2, name: 'Preencha nome, cidade e valor', text: 'Digite o nome do recebedor (até 25 caracteres), a cidade e opcionalmente um valor fixo.', url: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix#passo-2' },
      { '@type': 'HowToStep', position: 3, name: 'Baixe o QR Code', text: 'Faça download em PNG ou SVG e use onde quiser.', url: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix#passo-3' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Gerador de QR Code Pix Grátis Online',
    description: 'Gere QR Code para pagamento via Pix com chave CPF, CNPJ, e-mail ou aleatória. Payload BR Code EMV válido, gerado no navegador sem cadastro.',
    url: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix',
    inLanguage: 'pt-BR',
    datePublished: '2026-01-15',
    dateModified: '2026-03-27',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    about: { '@type': 'Thing', name: 'Pix (Sistema de Pagamentos Instantâneos do Banco Central)' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Gerador de QR Code Pix', item: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix' },
    ],
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const tool = await reader.collections.ferramentas.read('gerador-de-qr-code-pix')
  return {
    title: tool?.title ?? 'Gerador de QR Code Pix Grátis | Crie seu QR Pix',
    description: tool?.metaDescription ?? 'Gere seu QR Code Pix grátis em segundos. CPF, CNPJ, e-mail ou chave aleatória. Payload BR Code EMV válido. Sem cadastro, 100% privado.',
    alternates: {
      canonical: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix',
    },
    openGraph: {
      title: tool?.ogTitle ?? 'Gerador de QR Code Pix Grátis | Crie seu QR Pix Online | GeraCode',
      description: tool?.ogDescription ?? 'Gere seu QR Code Pix grátis em segundos. CPF, CNPJ, e-mail ou chave aleatória. Payload BR Code EMV válido. Sem cadastro, 100% privado.',
      url: 'https://www.geracodigo.com.br/gerador-de-qr-code-pix',
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: '/gerador-de-qr-code-pix/opengraph-image', width: 1200, height: 630, alt: 'Gerador de QR Code Pix Grátis | GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool?.twitterTitle ?? 'Gerador de QR Code Pix Grátis | GeraCode',
      description: tool?.twitterDescription ?? 'Gere QR Code para pagamento via Pix. Payload BR Code EMV válido. Sem cadastro.',
      images: ['/gerador-de-qr-code-pix/opengraph-image'],
    },
  }
}

export default async function PixPage() {
  const [tool, faqsAll] = await Promise.all([
    reader.collections.ferramentas.read('gerador-de-qr-code-pix'),
    reader.collections.faqs.all(),
  ])
  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'qr-code-pix')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot="pix-top" format="horizontal" />
      </div>

      <Breadcrumb current="Gerador de QR Code Pix" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool?.h1 ?? 'Gerador de QR Code Pix Grátis Online'}</h1>
        <p className="text-gray-600">{tool?.subtitle ?? 'Gere QR Code Pix estático válido (payload BR Code EMV, padrão Banco Central do Brasil)'}</p>
        <p className="text-sm text-indigo-600 mt-1"><span aria-hidden="true">{'\u{1F512}'}</span> Gerado direto no seu navegador. Seus dados nunca saem do seu computador</p>
        <LastUpdated date={LAST_UPDATED} isoDate={LAST_UPDATED_ISO} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <PixGenerator />
        </div>
        <aside className="lg:w-[300px] flex flex-col items-center lg:items-start gap-6">
          <AdSlot slot="pix-sidebar" format="rectangle" />
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800" aria-labelledby="info-cobrancas">
            <h3 id="info-cobrancas" className="font-semibold mb-1"><span aria-hidden="true">ℹ️</span> Cobranças Estáticas</h3>
            <p>Este QR gera cobranças estáticas (sem confirmação automática). Para cobranças com notificação, use a API Pix do seu banco.</p>
          </section>
        </aside>
      </div>

      <div className="flex justify-center mt-8">
        <AdSlot slot="pix-bottom" format="horizontal" />
      </div>

      {/* Como usar */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Como gerar QR Code Pix</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Informe sua chave Pix', desc: 'Selecione o tipo (CPF, CNPJ, e-mail, telefone ou chave aleatória) e insira o valor da chave cadastrada no seu banco.' },
            { step: '2', title: 'Preencha nome e cidade', desc: 'Digite o nome do recebedor (até 25 caracteres) e a cidade. Opcionalmente, defina um valor fixo e descrição da cobrança.' },
            { step: '3', title: 'Baixe o QR Code', desc: 'O QR Code é gerado instantaneamente no seu navegador. Faça download em PNG ou SVG e use onde quiser.' },
          ].map(({ step, title, desc }) => (
            <article key={step} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-lg flex items-center justify-center mb-4" aria-hidden="true">{step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* O que é */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">O que é o QR Code Pix?</h2>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
          <p>O <strong>QR Code Pix</strong> é uma forma de receber pagamentos instantâneos pelo <a href="https://www.bcb.gov.br/estabilidadefinanceira/pix" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">sistema Pix do Banco Central do Brasil</a>. Ao escanear o QR Code com qualquer aplicativo bancário, o pagador é direcionado automaticamente para a tela de pagamento com os dados do recebedor preenchidos.</p>
          <p>O payload gerado segue o padrão <strong>BR Code EMV</strong>, <a href="https://www.bcb.gov.br/estabilidadefinanceira/pagamentosinstantaneos" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">especificação oficial do Banco Central</a>, compatível com todos os bancos e fintechs participantes do Pix no Brasil, incluindo Nubank, Itaú, Bradesco, Caixa, Banco do Brasil, Inter, PagSeguro, Mercado Pago e outros.</p>
          <p>O GeraCode gera <strong>QR Codes estáticos</strong>, ideais para cobranças com valor fixo ou aberto (o pagador digita o valor). Para cobranças dinâmicas com confirmação automática e geração de comprovante, é necessário utilizar a API Pix do seu banco.</p>
        </div>
      </section>

      {/* Tipos de Chave Pix */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Chave Pix Suportados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'CPF', desc: 'Chave vinculada ao CPF do recebedor. Formato: 11 dígitos numéricos (ex: 12345678901). Ideal para pessoas físicas e autônomos.' },
            { title: 'CNPJ', desc: 'Chave vinculada ao CNPJ da empresa. Formato: 14 dígitos numéricos (ex: 12345678000190). Indicada para empresas e MEIs.' },
            { title: 'E-mail', desc: 'Endereço de e-mail cadastrado como chave Pix no banco. Aceita qualquer formato de e-mail válido. Prático para profissionais liberais.' },
            { title: 'Telefone', desc: 'Número de celular com código do país (+55) e DDD. Formato: +5511999999999. Conveniente para pequenos comerciantes e prestadores de serviço.' },
            { title: 'Chave Aleatória (UUID)', desc: 'Código alfanumérico gerado pelo banco (formato UUID). Ideal quando você não quer expor dados pessoais como CPF ou telefone ao receber pagamentos.' },
          ].map(({ title, desc }) => (
            <article key={title}>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex justify-center mt-16">
        <AdSlot slot="pix-mid" format="responsive" />
      </div>

      {/* Bancos compatíveis */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bancos e Fintechs Compatíveis</h2>
        <p className="text-gray-600 mb-6">
          O QR Code Pix gerado pelo GeraCode segue o <a href="https://www.bcb.gov.br/estabilidadefinanceira/pix" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800">padrão BR Code EMV do Banco Central</a> e é compatível com <strong>todos</strong> os bancos e fintechs participantes do sistema Pix, incluindo:
        </p>
        <div className="flex flex-wrap gap-3">
          {['Nubank', 'Itaú', 'Bradesco', 'Banco do Brasil', 'Caixa Econômica', 'Santander', 'Inter', 'PagSeguro', 'Mercado Pago', 'C6 Bank', 'BTG Pactual', 'Sicoob', 'Sicredi', 'Banrisul', 'Original', 'Neon', 'PicPay', 'Iti'].map((bank) => (
            <span key={bank} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
              {bank}
            </span>
          ))}
        </div>
      </section>

      {/* Dicas para usar QR Code Pix */}
      <section className="mt-16 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dicas para Usar seu QR Code Pix</h2>
        <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Imprima em tamanho adequado:</strong> Para leitura confiável, imprima o QR Code com pelo menos 3 × 3 cm. Em balcões e totens, prefira 5 × 5 cm ou maior.</li>
            <li><strong>Use SVG para impressão:</strong> O formato SVG mantém a qualidade em qualquer tamanho, sem pixels ou borrosidade. Ideal para adesivos, placas e materiais gráficos.</li>
            <li><strong>Teste antes de usar:</strong> Sempre escaneie o QR Code com seu próprio aplicativo bancário para confirmar que os dados estão corretos antes de disponibilizar para clientes.</li>
            <li><strong>Valor fixo vs. aberto:</strong> Se você vende produtos com preço fixo, defina o valor no gerador. Para doações ou serviços variados, deixe o campo de valor em branco para que o pagador digite.</li>
          </ul>
        </div>
      </section>

      <FAQSection items={faqs.length > 0 ? faqs : [
        { question: 'O QR Code Pix gerado aqui é válido?', answer: 'Sim. O payload segue o padrão BR Code EMV definido pelo Banco Central do Brasil. O QR Code é testado com o algoritmo CRC16 e funciona em todos os bancos participantes do Pix.' },
        { question: 'Meus dados ficam salvos em algum servidor?', answer: 'Não. Todo o processamento acontece no seu navegador (client-side). Nenhum dado (chave Pix, nome, valor) é enviado para servidores externos.' },
        { question: 'Qual é a diferença entre QR Code estático e dinâmico?', answer: 'O QR Code estático, gerado aqui, é fixo e pode ser usado múltiplas vezes. O QR Code dinâmico é gerado pela API do banco para cada cobrança, com controle de pagamento e notificação automática.' },
        { question: 'Posso usar este QR Code no meu e-commerce?', answer: 'Sim, para cobranças simples. Basta inserir o QR Code como imagem no seu site ou imprimir para uso físico. Para integração automática com confirmação de pedido, use a API Pix do seu banco.' },
        { question: 'O gerador funciona para Pix com CPF, CNPJ, e-mail e telefone?', answer: 'Sim, todos os tipos de chave Pix são suportados: CPF, CNPJ, e-mail, telefone (com +55) e chave aleatória (UUID).' },
      ]} />

      <RelatedTools currentPath="/gerador-de-qr-code-pix" />
    </div>
  )
}
