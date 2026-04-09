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
    datePublished: '2026-01-15',
    dateModified: '2026-04-09',
    isPartOf: { '@id': 'https://www.geracodigo.com.br/#website' },
    publisher: { '@id': 'https://www.geracodigo.com.br/#organization' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'GeraCode', item: 'https://www.geracodigo.com.br/' },
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
  openGraph: {
    title: 'Política de Privacidade | GeraCode',
    description: 'Saiba como o GeraCode trata seus dados. Processamento 100% local, sem coleta de dados pessoais.',
    url: 'https://www.geracodigo.com.br/privacidade',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'GeraCode',
    images: [{ url: '/privacidade/opengraph-image', width: 1200, height: 630, alt: 'Política de Privacidade | GeraCode' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Política de Privacidade | GeraCode',
    description: 'Saiba como o GeraCode trata seus dados. Processamento 100% local, sem coleta de dados pessoais.',
    images: ['/privacidade/opengraph-image'],
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
      <p className="text-gray-500 text-sm mb-8">Última atualização: abril de 2026</p>

      <div className="bg-white rounded-xl border border-gray-200 p-8">

        <h2 className={sectionTitle}>1. Controlador de Dados</h2>
        <p className={paragraph}>
          O GeraCode (<a href="https://www.geracodigo.com.br" className="text-indigo-600 hover:underline">www.geracodigo.com.br</a>)
          é mantido como projeto independente. Para fins da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD),
          o controlador dos dados é o responsável pelo GeraCode, que pode ser contactado pelo e-mail:
        </p>
        <p className={paragraph}>
          <strong>E-mail para exercício de direitos:</strong>{' '}
          <a href="mailto:privacidade@geracodigo.com.br" className="text-indigo-600 hover:underline">
            privacidade@geracodigo.com.br
          </a>
        </p>

        <h2 className={sectionTitle}>2. Dados que Coletamos</h2>
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

        <h2 className={sectionTitle}>3. Base Legal para o Tratamento (Art. 7º da LGPD)</h2>
        <p className={paragraph}>
          O tratamento de dados pelo GeraCode ocorre com base nas seguintes hipóteses legais:
        </p>
        <ul className={list}>
          <li>
            <strong>Legítimo interesse (Art. 7º, IX):</strong> Cookies de análise (Google Analytics)
            são ativados por padrão para coletar métricas <strong>agregadas e anonimizadas</strong> de uso,
            necessárias para avaliar e melhorar o funcionamento do site. O titular tem{' '}
            <strong>direito de oposição</strong> a qualquer momento através do banner de cookies
            ou do link &quot;Preferências de Cookies&quot; no rodapé. Também utilizamos legítimo
            interesse como base para o armazenamento local (localStorage) do histórico de códigos
            gerados, que não sai do seu dispositivo.
          </li>
          <li>
            <strong>Consentimento (Art. 7º, I):</strong> Cookies de publicidade (Google AdSense) são
            ativados <strong>somente após o seu consentimento explícito</strong>, concedido através
            do banner de cookies. Sem o opt-in, nenhum anúncio personalizado é carregado.
          </li>
          <li>
            <strong>Cookies essenciais:</strong> O Service Worker (cache de arquivos estáticos para funcionamento
            offline) é estritamente necessário para o funcionamento do site e não requer consentimento.
          </li>
        </ul>

        <h2 className={sectionTitle}>4. Armazenamento Local</h2>
        <p className={paragraph}>
          O GeraCode utiliza o <strong>localStorage</strong> do navegador para salvar o histórico de
          códigos gerados (máximo de 30 itens). Esses dados permanecem exclusivamente no dispositivo do usuário e podem
          ser apagados a qualquer momento através da função &quot;Limpar tudo&quot; disponível no histórico
          ou limpando os dados do site nas configurações do navegador.
        </p>

        <h2 className={sectionTitle}>5. Cookies e Tecnologias de Rastreamento</h2>
        <p className={paragraph}>
          O GeraCode utiliza o <strong>Google Consent Mode v2</strong> para gerenciar as categorias
          de cookies. Cookies de <strong>análise</strong> (Google Analytics) são ativados por padrão
          sob a base de legítimo interesse — você pode desativá-los a qualquer momento pelo banner
          de cookies ou pelo link &quot;Preferências de Cookies&quot; no rodapé. Cookies de{' '}
          <strong>publicidade</strong> (Google AdSense) permanecem desativados até o seu consentimento
          explícito.
        </p>

        <h3 className={subsectionTitle}>5.1. Cookies Essenciais (sempre ativos)</h3>
        <p className={paragraph}>
          Necessários para o funcionamento básico do site. Incluem o Service Worker para cache
          de arquivos estáticos e o registro das suas preferências de consentimento. Não coletam
          dados pessoais.
        </p>

        <h3 className={subsectionTitle}>5.2. Google Analytics (GA4) — legítimo interesse, com direito de oposição</h3>
        <p className={paragraph}>
          Utilizamos o Google Analytics 4 para compreender, de forma agregada e anonimizada, como
          os usuários interagem com o site. Essa coleta é ativada por padrão sob a base de{' '}
          <strong>legítimo interesse</strong> (Art. 7º, IX da LGPD) e você pode se opor a qualquer
          momento pelo banner de cookies. O GA4 coleta dados anonimizados como:
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

        <h3 className={subsectionTitle}>5.3. Google AdSense — requer consentimento</h3>
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

        <h3 className={subsectionTitle}>5.4. Service Worker (PWA)</h3>
        <p className={paragraph}>
          Utilizamos um Service Worker para permitir o funcionamento offline das ferramentas.
          O Service Worker armazena em cache os arquivos estáticos do site no seu dispositivo.
          Nenhum dado pessoal é armazenado pelo Service Worker.
        </p>

        <h2 className={sectionTitle}>6. Transferência Internacional de Dados</h2>
        <p className={paragraph}>
          Quando você concede consentimento para cookies de análise e/ou publicidade, os dados
          coletados pelo Google Analytics e Google AdSense podem ser transferidos e processados
          pelo Google LLC em servidores localizados nos <strong>Estados Unidos</strong> e em outros
          países. O Google adota cláusulas contratuais padrão e medidas de segurança conforme
          descrito na{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            Política de Privacidade do Google
          </a>{' '}
          e no{' '}
          <a href="https://privacy.google.com/businesses/processorterms/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            Adendo de Tratamento de Dados do Google
          </a>.
        </p>
        <p className={paragraph}>
          Essa transferência está amparada pelo Art. 33, II da LGPD, que permite transferências
          quando o controlador oferece garantias adequadas de proteção.
        </p>

        <h2 className={sectionTitle}>7. Retenção de Dados</h2>
        <ul className={list}>
          <li>
            <strong>localStorage (histórico de códigos):</strong> Permanece no dispositivo até ser
            excluído manualmente pelo usuário ou pela limpeza dos dados do navegador. Máximo de 30 itens.
          </li>
          <li>
            <strong>Google Analytics:</strong> Os dados são retidos pelo Google por 14 meses (configuração
            padrão do GA4), após os quais são automaticamente excluídos.
          </li>
          <li>
            <strong>Google AdSense:</strong> Os cookies de publicidade são gerenciados pelo Google conforme
            sua política de retenção. Você pode excluí-los a qualquer momento pelas configurações do navegador.
          </li>
          <li>
            <strong>Preferências de consentimento:</strong> Armazenadas no localStorage do navegador
            sem prazo de expiração. Podem ser revogadas a qualquer momento pelo banner de cookies.
          </li>
        </ul>

        <h2 className={sectionTitle}>8. Seus Direitos (Art. 18 da LGPD)</h2>
        <p className={paragraph}>
          De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem os seguintes direitos:
        </p>
        <ul className={list}>
          <li>
            <strong>Confirmação e acesso (Art. 18, I e II):</strong> Confirmar a existência de tratamento
            e acessar seus dados. O GeraCode não armazena dados pessoais em servidores — o histórico
            é local e pode ser visualizado no próprio navegador.
          </li>
          <li>
            <strong>Correção (Art. 18, III):</strong> Solicitar a correção de dados incompletos ou
            desatualizados. Dados locais podem ser editados diretamente no navegador.
          </li>
          <li>
            <strong>Anonimização, bloqueio ou eliminação (Art. 18, IV):</strong> Apague o histórico
            de códigos a qualquer momento pela interface (&quot;Limpar tudo&quot;) ou limpando os dados do site
            nas configurações do navegador.
          </li>
          <li>
            <strong>Portabilidade (Art. 18, V):</strong> Os dados armazenados localmente podem ser
            exportados pelo próprio navegador. Dados do Google Analytics são anonimizados e não
            permitem identificação individual.
          </li>
          <li>
            <strong>Eliminação com consentimento (Art. 18, VI):</strong> Dados tratados com base no
            consentimento podem ser eliminados revogando-o pelo banner de cookies.
          </li>
          <li>
            <strong>Informação sobre compartilhamento (Art. 18, VII):</strong> Os dados de análise
            e publicidade são compartilhados exclusivamente com o Google LLC, conforme descrito nas
            seções 5 e 6 desta política.
          </li>
          <li>
            <strong>Revogação do consentimento (Art. 18, IX):</strong> Você pode revogar seu consentimento
            a qualquer momento clicando no link &quot;Preferências de Cookies&quot; no rodapé do site.
            A revogação não afeta o tratamento realizado anteriormente.
          </li>
          <li>
            <strong>Opt-out do Analytics:</strong> Instale o{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              complemento de desativação do Google Analytics
            </a>
          </li>
          <li>
            <strong>Petição à ANPD (Art. 18, §1º):</strong> Você tem o direito de peticionar à
            Autoridade Nacional de Proteção de Dados (ANPD) em relação aos seus dados pessoais.
            Acesse{' '}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              www.gov.br/anpd
            </a>.
          </li>
        </ul>

        <h2 className={sectionTitle}>9. Segurança</h2>
        <p className={paragraph}>
          O GeraCode implementa as seguintes medidas de segurança:
        </p>
        <ul className={list}>
          <li><strong>HTTPS:</strong> Toda a comunicação é criptografada via TLS/SSL</li>
          <li><strong>Content Security Policy (CSP):</strong> Restringe a execução de scripts a domínios autorizados</li>
          <li><strong>Google Consent Mode v2:</strong> Cookies de publicidade bloqueados até consentimento explícito; analytics sob legítimo interesse com opt-out a qualquer momento</li>
          <li><strong>Processamento local:</strong> Dados sensíveis (chaves Pix, códigos) nunca trafegam pela rede</li>
          <li><strong>Sem cadastro:</strong> Nenhuma conta de usuário é criada ou armazenada</li>
        </ul>

        <h2 className={sectionTitle}>10. Alterações nesta Política</h2>
        <p className={paragraph}>
          Reservamo-nos o direito de atualizar esta Política de Privacidade a qualquer momento.
          Alterações significativas serão comunicadas através de aviso no site. O uso continuado
          do GeraCode após alterações constitui aceitação da nova política.
        </p>

        <h2 className={sectionTitle}>11. Contato e Encarregado de Dados</h2>
        <p className={paragraph}>
          Para exercer qualquer um dos seus direitos previstos na LGPD, esclarecer dúvidas sobre
          o tratamento dos seus dados ou apresentar reclamações, entre em contato conosco:
        </p>
        <ul className={list}>
          <li>
            <strong>E-mail:</strong>{' '}
            <a href="mailto:privacidade@geracodigo.com.br" className="text-indigo-600 hover:underline">
              privacidade@geracodigo.com.br
            </a>
          </li>
          <li>
            <strong>Prazo de resposta:</strong> Responderemos às solicitações em até 15 dias úteis,
            conforme previsto na LGPD.
          </li>
        </ul>
        <p className={paragraph}>
          Consulte também nossos{' '}
          <Link href="/termos" className="text-indigo-600 hover:underline">Termos de Uso</Link>{' '}
          e a página{' '}
          <Link href="/sobre" className="text-indigo-600 hover:underline">Sobre</Link>{' '}
          para mais informações sobre o GeraCode.
        </p>
      </div>
    </div>
  )
}
