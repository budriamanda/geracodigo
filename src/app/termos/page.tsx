import type { Metadata } from 'next'
import Link from 'next/link'
import SchemaMarkup from '@/components/SchemaMarkup'
import Breadcrumb from '@/components/Breadcrumb'

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Termos de Uso',
    description: 'Termos de Uso do GeraCode. Condições de uso das ferramentas gratuitas de geração de código de barras e QR Code.',
    url: 'https://www.geracodigo.com.br/termos',
    inLanguage: 'pt-BR',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Termos de Uso', item: 'https://www.geracodigo.com.br/termos' },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de Uso do GeraCode. Condições de uso das ferramentas gratuitas de geração de código de barras, QR Code Pix e SKU.',
  alternates: {
    canonical: 'https://www.geracodigo.com.br/termos',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const sectionTitle = 'text-2xl font-bold text-gray-900 mb-4 mt-12 first:mt-0'
const paragraph = 'text-gray-600 text-sm leading-relaxed mb-4'
const list = 'list-disc pl-5 space-y-2 text-sm text-gray-600 mb-4'

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <Breadcrumb current="Termos de Uso" />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
      <p className="text-gray-500 text-sm mb-8">Última atualização: março de 2026</p>

      <div className="bg-white rounded-xl border border-gray-200 p-8">

        <h2 className={sectionTitle}>1. Aceitação dos Termos</h2>
        <p className={paragraph}>
          Ao acessar e utilizar o GeraCode (www.geracodigo.com.br), você concorda com estes Termos de Uso.
          Se não concordar com qualquer parte destes termos, não utilize o serviço.
        </p>

        <h2 className={sectionTitle}>2. Descrição do Serviço</h2>
        <p className={paragraph}>
          O GeraCode é um conjunto de ferramentas online gratuitas para geração de códigos de barras
          (EAN-13, Code 128, UPC-A e outros formatos), QR Codes, QR Code Pix, leitura de códigos de barras
          e geração de SKUs. Todas as ferramentas processam dados exclusivamente no navegador do usuário
          (client-side), sem enviar informações para servidores externos.
        </p>

        <h2 className={sectionTitle}>3. Uso Permitido</h2>
        <p className={paragraph}>Você pode utilizar o GeraCode para:</p>
        <ul className={list}>
          <li>Gerar códigos de barras para uso interno, e-commerce próprio, testes e protótipos</li>
          <li>Gerar QR Codes para links, textos e conteúdos diversos</li>
          <li>Gerar QR Codes Pix estáticos para recebimento de pagamentos</li>
          <li>Ler códigos de barras e QR Codes usando a câmera do dispositivo</li>
          <li>Gerar códigos SKU para organização de estoque</li>
        </ul>

        <h2 className={sectionTitle}>4. Limitações</h2>
        <ul className={list}>
          <li>
            <strong>Códigos EAN para varejo:</strong> Para comercializar produtos em redes varejistas
            (supermercados, farmácias), os códigos EAN devem ser registrados na GS1 Brasil.
            O GeraCode não substitui o registro oficial.
          </li>
          <li>
            <strong>QR Code Pix:</strong> O GeraCode gera QR Codes Pix estáticos. Para cobranças
            dinâmicas com confirmação automática, utilize a API Pix do seu banco.
          </li>
          <li>
            <strong>Sem garantia:</strong> O serviço é fornecido &quot;como está&quot;,
            sem garantias de disponibilidade ininterrupta ou adequação a qualquer finalidade específica.
          </li>
        </ul>

        <h2 className={sectionTitle}>5. Propriedade Intelectual</h2>
        <p className={paragraph}>
          O código-fonte, design, textos e marca GeraCode são propriedade do projeto.
          Os códigos gerados pelos usuários (códigos de barras, QR Codes, SKUs) pertencem integralmente
          ao usuário que os criou.
        </p>

        <h2 className={sectionTitle}>6. Segurança</h2>
        <p className={paragraph}>
          O GeraCode implementa as seguintes medidas de segurança:
        </p>
        <ul className={list}>
          <li><strong>HTTPS:</strong> Toda a comunicação é criptografada via TLS/SSL</li>
          <li><strong>Content Security Policy (CSP):</strong> Restringe a execução de scripts a domínios autorizados</li>
          <li><strong>Processamento local:</strong> Dados sensíveis (chaves Pix, códigos) nunca trafegam pela rede</li>
          <li><strong>Sem cadastro:</strong> Nenhuma conta de usuário é criada ou armazenada</li>
        </ul>

        <h2 className={sectionTitle}>7. Alterações nestes Termos</h2>
        <p className={paragraph}>
          Reservamo-nos o direito de atualizar estes Termos de Uso a qualquer momento. Alterações
          significativas serão comunicadas através de aviso no site. O uso continuado do GeraCode
          após alterações constitui aceitação dos novos termos.
        </p>

        <h2 className={sectionTitle}>8. Contato</h2>
        <p className={paragraph}>
          Para dúvidas sobre estes termos, acesse a página{' '}
          <Link href="/sobre" className="text-indigo-600 hover:underline">Sobre</Link>{' '}
          para mais informações sobre o GeraCode. Para informações sobre como tratamos seus dados,
          consulte nossa{' '}
          <Link href="/privacidade" className="text-indigo-600 hover:underline">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  )
}
