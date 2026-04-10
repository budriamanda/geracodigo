import type { Metadata } from 'next'
import Link from 'next/link'
import SchemaMarkup from '@/components/SchemaMarkup'
import Breadcrumb from '@/components/Breadcrumb'
import AdSlot from '@/components/AdSlot'

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Sobre o GeraCode',
    description: 'Conheça o GeraCode, plataforma gratuita de geração de código de barras e QR Code Pix para lojistas brasileiros.',
    url: 'https://www.geracodigo.com.br/sobre',
    inLanguage: 'pt-BR',
    datePublished: '2026-01-15',
    dateModified: '2026-03-01',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
    mainEntity: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
      { '@type': 'ListItem', position: 2, name: 'Sobre', item: 'https://www.geracodigo.com.br/sobre' },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Sobre | Ferramentas Gratuitas para Lojistas',
  description: 'Conheça o GeraCode: plataforma gratuita e 100% privada de geração de código de barras e QR Code Pix para lojistas e empreendedores brasileiros.',
  alternates: {
    canonical: 'https://www.geracodigo.com.br/sobre',
  },
  openGraph: {
    title: 'Sobre o GeraCode | Ferramentas Gratuitas para Lojistas Brasileiros',
    description: 'Conheça o GeraCode: plataforma gratuita e 100% privada de geração de código de barras e QR Code Pix.',
    url: 'https://www.geracodigo.com.br/sobre',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'GeraCode',
    images: [{ url: '/sobre/opengraph-image', width: 1200, height: 630, alt: 'Sobre o GeraCode | Ferramentas Gratuitas para Lojistas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre o GeraCode | Ferramentas Gratuitas para Lojistas',
    description: 'Conheça o GeraCode: plataforma gratuita e 100% privada de geração de código de barras e QR Code Pix.',
    images: ['/sobre/opengraph-image'],
  },
}

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <Breadcrumb current="Sobre" />

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sobre o GeraCode</h1>

      <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Nossa Missão</h2>
          <p>
            O <strong>GeraCode</strong> nasceu com uma missão clara: oferecer ferramentas gratuitas, simples e seguras para lojistas e empreendedores brasileiros
            que precisam gerar códigos de barras e QR Codes no dia a dia.
          </p>
          <p>
            Acreditamos que todo pequeno negócio merece acesso a ferramentas profissionais sem custo, sem cadastro e sem complicação.
            Por isso, criamos uma plataforma que funciona 100% no navegador do usuário, garantindo total privacidade dos dados.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Como Funciona</h2>
          <p>
            Todas as ferramentas do GeraCode utilizam processamento <strong>client-side</strong> (no lado do cliente). Isso significa que nenhum dado
            que você insere (chave Pix, nome, valor, código de barras) é enviado para servidores externos. O processamento acontece inteiramente
            no seu dispositivo, seja computador, tablet ou smartphone.
          </p>
          <p>
            Utilizamos tecnologias modernas e confiáveis: o gerador de QR Code Pix implementa o padrão <strong>BR Code EMV</strong> definido pelo
            Banco Central do Brasil, com checksum CRC16 válido. Os códigos de barras são gerados com a biblioteca JsBarcode, amplamente reconhecida
            no mercado. Os QR Codes utilizam a biblioteca QRCode para Node.js.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Nossas Ferramentas</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <Link href="/gerador-de-qr-code-pix" className="text-indigo-600 hover:underline font-medium">Gerador de QR Code Pix</Link>
              : Crie QR Codes para pagamento via Pix com payload BR Code EMV válido. Suporta chaves CPF, CNPJ, e-mail, telefone e aleatória.
            </li>
            <li>
              <Link href="/gerador-de-codigo-de-barras" className="text-indigo-600 hover:underline font-medium">Gerador de Código de Barras</Link>
              : 12 formatos incluindo EAN-13, Code 128, Code 93, UPC-A, ITF-14 e Codabar. Geração em lote, PDF, etiquetas e histórico.
            </li>
            <li>
              <Link href="/gerador-de-ean" className="text-indigo-600 hover:underline font-medium">Gerador de EAN-13 e EAN-8</Link>
              : Gerador dedicado com cálculo automático do dígito verificador. Download em PNG, SVG e PDF.
            </li>
            <li>
              <Link href="/gerador-de-qr-code" className="text-indigo-600 hover:underline font-medium">Gerador de QR Code</Link>
              : Gere QR Code para links, textos, WhatsApp, Wi-Fi e qualquer conteúdo. Color picker e seletor de tamanho inclusos.
            </li>
            <li>
              <Link href="/leitor-de-codigo-de-barras" className="text-indigo-600 hover:underline font-medium">Leitor de Código de Barras</Link>
              : Use a câmera do celular ou computador para ler códigos de barras e QR Codes. Sem instalar aplicativo.
            </li>
            <li>
              <Link href="/gerador-de-sku" className="text-indigo-600 hover:underline font-medium">Gerador de SKU</Link>
              : Crie códigos SKU padronizados para organizar seu estoque. Geração em lote e exportação CSV.
            </li>
          </ul>
        </section>

        <div className="flex justify-center my-12">
          <AdSlot slot="sobre-mid" format="responsive" />
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacidade e Segurança</h2>
          <p>
            A privacidade dos nossos usuários é prioridade absoluta. O GeraCode:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Não coleta dados pessoais</li>
            <li>Não exige cadastro ou login</li>
            <li>Não armazena nenhuma informação inserida nas ferramentas</li>
            <li>Processa tudo localmente no navegador do usuário</li>
            <li>Não compartilha dados com terceiros</li>
            <li>Utiliza HTTPS em todas as conexões</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Para Quem é o GeraCode</h2>
          <p>
            O GeraCode foi projetado para atender diversas necessidades do mercado brasileiro:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Lojistas e e-commerce:</strong> Gere códigos de barras para produtos e QR Code Pix para receber pagamentos.</li>
            <li><strong>MEIs e autônomos:</strong> Crie seu QR Code Pix profissional para cobranças de forma rápida e gratuita.</li>
            <li><strong>Restaurantes e food service:</strong> QR Code para cardápios digitais e QR Pix para pagamentos no balcão.</li>
            <li><strong>Profissionais de marketing:</strong> QR Codes personalizados para campanhas, embalagens e materiais impressos.</li>
            <li><strong>Desenvolvedores:</strong> Teste e valide códigos de barras e payloads Pix durante o desenvolvimento.</li>
          </ul>
        </section>

        <section className="bg-indigo-50 rounded-xl p-6 not-prose">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Comece agora</h2>
          <p className="text-gray-600 mb-4">
            Escolha uma das nossas ferramentas e comece a gerar seus códigos gratuitamente. Sem cadastro, sem limite de uso.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Ver todas as ferramentas
          </Link>
        </section>
      </div>
    </div>
  )
}
