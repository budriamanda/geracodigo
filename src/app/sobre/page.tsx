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
          <p>
            Cada ferramenta é coberta por uma <strong>suíte de testes automatizados</strong> que valida a conformidade com as especificações oficiais —
            desde o cálculo do dígito verificador EAN (algoritmo módulo 10) até a geração do payload Pix (verificação CRC16-CCITT e validação dos
            campos EMV obrigatórios). Os códigos gerados podem ser validados por qualquer leitor ou aplicativo bancário padrão de mercado.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Política Editorial e Compromisso com Qualidade</h2>
          <p>
            Todo o conteúdo publicado no GeraCode — textos explicativos, FAQs, guias de uso e referências técnicas — é escrito com base em
            <strong> fontes oficiais e verificáveis</strong>, como a documentação do Banco Central do Brasil para o Pix, as especificações
            públicas da GS1 (padrões EAN/GTIN) e as normas ISO/IEC aplicáveis a códigos de barras 1D e 2D.
          </p>
          <p>
            Adotamos os seguintes princípios editoriais:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Precisão técnica:</strong> cada afirmação envolvendo padrões (EAN-13, BR Code, Code 128, UPC-A) é verificada contra a especificação oficial antes da publicação.</li>
            <li><strong>Linguagem acessível:</strong> escrevemos para lojistas e empreendedores, não apenas para desenvolvedores. Termos técnicos são sempre explicados na primeira ocorrência.</li>
            <li><strong>Atualização contínua:</strong> revisamos os guias sempre que há mudanças relevantes nas regulamentações (por exemplo, novas regras do Pix publicadas pelo Banco Central) ou nas diretrizes da GS1 Brasil.</li>
            <li><strong>Referências visíveis:</strong> quando citamos uma regra, política ou padrão, incluímos link direto para a fonte oficial para que o leitor possa verificar.</li>
            <li><strong>Sem conteúdo patrocinado disfarçado:</strong> não recebemos pagamento para recomendar bancos, fintechs, marketplaces ou software. Recomendações e comparações refletem apenas critérios técnicos e de adequação ao público brasileiro.</li>
          </ul>
          <p>
            Erros factuais ou desatualizações podem ser reportados pelo canal de contato abaixo. Correções relevantes são aplicadas em até 7 dias
            úteis e registradas na data de &quot;última atualização&quot; de cada página.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Quem Mantém o GeraCode</h2>
          <p>
            O GeraCode é mantido por uma pequena equipe brasileira com experiência em desenvolvimento web, e-commerce e integrações de pagamento.
            O projeto começou como uma ferramenta interna usada por lojistas parceiros que precisavam gerar QR Codes Pix e códigos de barras
            rapidamente, sem depender de softwares pagos ou sites intrusivos carregados de rastreadores.
          </p>
          <p>
            Depois de perceber que a mesma dor atingia milhares de MEIs, autônomos e pequenas empresas no Brasil, decidimos abrir o acesso
            gratuito, preservando os dois compromissos que consideramos inegociáveis: <strong>privacidade por padrão</strong> (processamento
            local) e <strong>conformidade técnica</strong> com os padrões oficiais (Banco Central, GS1, ISO/IEC).
          </p>
          <p>
            O funcionamento das ferramentas é auditável pelo próprio usuário — basta abrir o DevTools do navegador (F12), aba &quot;Network&quot;,
            e acompanhar que nenhuma requisição é feita para servidores externos durante a geração dos códigos. A única comunicação com a rede
            acontece para carregar a página inicial, os scripts estáticos e os anúncios que sustentam o projeto gratuito.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Contato</h2>
          <p>
            Dúvidas, sugestões, correções ou denúncias de conteúdo podem ser enviadas para:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>E-mail:</strong> <a href="mailto:amandabudric@gmail.com" className="text-indigo-600 hover:underline">amandabudric@gmail.com</a></li>
            <li><strong>Assuntos técnicos</strong> (código incorreto, erro de leitura, formato não suportado): inclua um print da ferramenta e o dado de entrada utilizado.</li>
            <li><strong>Assuntos editoriais</strong> (correção em guia, FAQ desatualizada, sugestão de tema): indique a URL da página e, se possível, a fonte oficial que embasa a correção.</li>
            <li><strong>Imprensa e parcerias:</strong> use o mesmo e-mail identificando no assunto &quot;Imprensa&quot; ou &quot;Parceria&quot;.</li>
          </ul>
          <p className="text-sm">
            Respondemos em até 3 dias úteis. O GeraCode não oferece suporte para integrações customizadas, APIs de bancos ou desenvolvimento
            sob demanda — somos apenas uma plataforma de ferramentas prontas para uso.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Como Nos Financiamos</h2>
          <p>
            O GeraCode é gratuito para todos os usuários e não tem plano pago, assinatura, limite de uso ou versão &quot;premium&quot;. O projeto
            é sustentado por <strong>anúncios exibidos nas páginas de ferramentas</strong>, sempre em áreas claramente identificadas e nunca
            intercalados ao resultado da geração (para evitar confusão entre o código gerado e conteúdo patrocinado).
          </p>
          <p>
            Os anúncios são servidos por redes reconhecidas e seguem as boas práticas de transparência: não são exibidos banners que imitam
            botões das ferramentas, não há pop-ups intrusivos e não há cobrança disfarçada. Usuários podem utilizar bloqueadores de anúncios
            livremente — as ferramentas continuam funcionando normalmente.
          </p>
          <p>
            Coletamos métricas agregadas de uso (página visitada, tempo de engajamento, ferramenta mais utilizada) através do Google Analytics 4
            com consentimento prévio, conforme descrito na nossa <Link href="/privacidade" className="text-indigo-600 hover:underline">Política de Privacidade</Link>.
            Nenhum dado inserido nas ferramentas (chave Pix, códigos, valores, nomes) é coletado — isso é garantido pela arquitetura client-side.
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
