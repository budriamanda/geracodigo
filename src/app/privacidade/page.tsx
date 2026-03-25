import type { Metadata } from 'next'
import Link from 'next/link'
import SchemaMarkup from '@/components/SchemaMarkup'
import Breadcrumb from '@/components/Breadcrumb'

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Política de Privacidade',
    description: 'Política de Privacidade do GeraCode. Saiba como tratamos seus dados, cookies, Google Analytics e Google AdSense.',
    url: 'https://www.geracodigo.com.br/privacidade',
    inLanguage: 'pt-BR',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Política de Privacidade', item: 'https://www.geracodigo.com.br/privacidade' },
    ],
  },
]

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade do GeraCode. Saiba como tratamos seus dados, cookies, Google Analytics e Google AdSense. Processamento 100% local, sem coleta de dados pessoais.',
  alternates: {
    canonical: 'https://www.geracodigo.com.br/privacidade',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const sectionTitle = 'text-2xl font-bold text-gray-900 mb-4 mt-12 first:mt-0'
const subsectionTitle = 'text-lg font-semibold text-gray-900 mb-2 mt-8'
const paragraph = 'text-gray-600 text-sm leading-relaxed mb-4'
const list = 'list-disc pl-5 space-y-2 text-sm text-gray-600 mb-4'

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <Breadcrumb current="Política de Privacidade" />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
      <p className="text-gray-500 text-sm mb-8">Última atualização: março de 2026</p>

      <div className="bg-white rounded-xl border border-gray-200 p-8">

        <h2 className={sectionTitle}>1. Dados que Coletamos</h2>
        <p className={paragraph}>
          O GeraCode foi projetado com privacidade como prioridade. Todas as ferramentas processam
          dados exclusivamente no navegador do usuário. <strong>Não coletamos, armazenamos ou
          transmitimos</strong> os seguintes dados:
        </p>
        <ul className={list}>
          <li>Códigos de barras ou QR Codes gerados</li>
          <li>Chaves Pix, nomes ou valores inseridos</li>
          <li>Imagens da câmera durante a leitura de códigos</li>
          <li>Códigos SKU criados</li>
          <li>Dados pessoais como nome, e-mail ou telefone</li>
        </ul>

        <h2 className={sectionTitle}>2. Armazenamento Local</h2>
        <p className={paragraph}>
          O GeraCode utiliza o <strong>localStorage</strong> do navegador para salvar o histórico de
          códigos gerados. Esses dados permanecem exclusivamente no dispositivo do usuário e podem
          ser apagados a qualquer momento através da função &quot;Limpar tudo&quot; disponível no histórico
          ou limpando os dados do site nas configurações do navegador.
        </p>

        <h2 className={sectionTitle}>3. Cookies e Tecnologias de Rastreamento</h2>

        <h3 className={subsectionTitle}>3.1. Google Analytics (GA4)</h3>
        <p className={paragraph}>
          Utilizamos o Google Analytics 4 para compreender como os usuários interagem com o site.
          O GA4 coleta dados anonimizados como:
        </p>
        <ul className={list}>
          <li>Páginas visitadas e tempo de permanência</li>
          <li>Tipo de dispositivo, navegador e sistema operacional</li>
          <li>País e cidade de origem (aproximado, não endereço exato)</li>
          <li>Eventos de interação (geração de código, download, impressão)</li>
        </ul>
        <p className={paragraph}>
          O Google Analytics utiliza cookies para identificar sessões de usuários.
          Esses dados são processados pelo Google de acordo com a{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            Política de Privacidade do Google
          </a>.
          Não combinamos dados do Analytics com informações pessoais identificáveis.
        </p>

        <h3 className={subsectionTitle}>3.2. Google AdSense</h3>
        <p className={paragraph}>
          O GeraCode pode exibir anúncios fornecidos pelo Google AdSense para manter o serviço
          gratuito. O Google AdSense pode utilizar cookies e tecnologias semelhantes para exibir
          anúncios relevantes com base nos interesses do usuário.
        </p>
        <p className={paragraph}>
          Você pode gerenciar suas preferências de anúncios personalizados visitando as{' '}
          <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            Configurações de Anúncios do Google
          </a>.
        </p>

        <h3 className={subsectionTitle}>3.3. Service Worker (PWA)</h3>
        <p className={paragraph}>
          Utilizamos um Service Worker para permitir o funcionamento offline das ferramentas.
          O Service Worker armazena em cache os arquivos estáticos do site no seu dispositivo.
          Nenhum dado pessoal é armazenado pelo Service Worker.
        </p>

        <h2 className={sectionTitle}>4. Seus Direitos (LGPD)</h2>
        <p className={paragraph}>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
        <ul className={list}>
          <li><strong>Limpar dados locais:</strong> Apague o histórico de códigos a qualquer momento pela interface ou limpando os dados do site no navegador</li>
          <li><strong>Desativar cookies:</strong> Configure seu navegador para bloquear cookies de terceiros (Google Analytics e AdSense)</li>
          <li><strong>Opt-out do Analytics:</strong> Instale o{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              complemento de desativação do Google Analytics
            </a>
          </li>
          <li><strong>Anúncios personalizados:</strong> Gerencie preferências nas{' '}
            <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Configurações de Anúncios do Google
            </a>
          </li>
        </ul>

        <h2 className={sectionTitle}>5. Segurança</h2>
        <p className={paragraph}>
          O GeraCode implementa as seguintes medidas de segurança:
        </p>
        <ul className={list}>
          <li><strong>HTTPS:</strong> Toda a comunicação é criptografada via TLS/SSL</li>
          <li><strong>Content Security Policy (CSP):</strong> Restringe a execução de scripts a domínios autorizados</li>
          <li><strong>Processamento local:</strong> Dados sensíveis (chaves Pix, códigos) nunca trafegam pela rede</li>
          <li><strong>Sem cadastro:</strong> Nenhuma conta de usuário é criada ou armazenada</li>
        </ul>

        <h2 className={sectionTitle}>6. Alterações nesta Política</h2>
        <p className={paragraph}>
          Reservamo-nos o direito de atualizar esta Política de Privacidade a qualquer momento.
          Alterações significativas serão comunicadas através de aviso no site. O uso continuado
          do GeraCode após alterações constitui aceitação da nova política.
        </p>

        <h2 className={sectionTitle}>7. Contato</h2>
        <p className={paragraph}>
          Para dúvidas sobre como seus dados são tratados, acesse
          a página{' '}
          <Link href="/sobre" className="text-indigo-600 hover:underline">Sobre</Link>{' '}
          para mais informações sobre o GeraCode. Consulte também nossos{' '}
          <Link href="/termos" className="text-indigo-600 hover:underline">Termos de Uso</Link>.
        </p>
      </div>
    </div>
  )
}
