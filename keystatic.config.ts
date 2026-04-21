import { config, fields, collection, singleton } from '@keystatic/core'

export default config({
  storage: { kind: 'local' },

  singletons: {
    siteConfig: singleton({
      label: 'Configurações do Site',
      path: 'content/site-config',
      format: 'yaml',
      schema: {
        siteName: fields.text({ label: 'Nome do Site' }),
        siteDescription: fields.text({ label: 'Meta Description (home)', multiline: true }),
        ogImage: fields.text({ label: 'URL da OG Image padrão' }),
      },
    }),

    homepage: singleton({
      label: 'Página inicial',
      path: 'content/homepage',
      format: 'yaml',
      schema: {
        title: fields.text({ label: 'Title Tag (absolute)' }),
        metaDescription: fields.text({ label: 'Meta Description', multiline: true }),
        ogTitle: fields.text({ label: 'OG Title' }),
        ogDescription: fields.text({ label: 'OG Description', multiline: true }),
        twitterTitle: fields.text({ label: 'Twitter Title' }),
        twitterDescription: fields.text({ label: 'Twitter Description', multiline: true }),

        heroH1: fields.text({ label: 'H1 do Hero' }),
        heroSubtitle: fields.text({ label: 'Subtítulo do Hero', multiline: true }),
        heroBadgeText: fields.text({ label: 'Texto do badge de privacidade' }),
        heroCtaText: fields.text({ label: 'Texto do CTA', defaultValue: 'Comece a gerar agora' }),
        heroCtaHref: fields.text({ label: 'Href do CTA', defaultValue: '#ferramentas' }),

        ferramentasSectionTitle: fields.text({ label: 'Título da seção de ferramentas', defaultValue: 'Ferramentas Disponíveis' }),

        porqueUsarTitle: fields.text({ label: 'Título "Por que usar"', defaultValue: 'Por que usar o GeraCode?' }),
        porqueUsarItems: fields.array(
          fields.object({
            icone: fields.text({ label: 'Emoji/Ícone' }),
            titulo: fields.text({ label: 'Título' }),
            descricao: fields.text({ label: 'Descrição', multiline: true }),
          }),
          { label: 'Itens "Por que usar"', itemLabel: (p) => p.fields.titulo.value },
        ),

        oQueETitle: fields.text({ label: 'Título "O que é"', defaultValue: 'O que é o GeraCode?' }),
        oQueEContent: fields.text({ label: 'Conteúdo "O que é" (Markdown)', multiline: true }),

        comoFuncionaTitle: fields.text({ label: 'Título "Como funciona"', defaultValue: 'Como funciona' }),
        comoFuncionaSteps: fields.array(
          fields.object({
            step: fields.text({ label: 'Número do passo' }),
            titulo: fields.text({ label: 'Título' }),
            descricao: fields.text({ label: 'Descrição', multiline: true }),
          }),
          { label: 'Passos "Como funciona"', itemLabel: (p) => p.fields.titulo.value },
        ),

        paraQuemTitle: fields.text({ label: 'Título "Para quem"', defaultValue: 'Para quem é o GeraCode?' }),
      },
    }),

    redirects: singleton({
      label: 'Redirecionamentos (301/302)',
      path: 'content/redirects',
      format: 'yaml',
      schema: {
        items: fields.array(
          fields.object({
            source: fields.text({ label: 'Source (URL antiga, ex: /pagina-antiga)' }),
            destination: fields.text({ label: 'Destination (nova URL ou URL absoluta)' }),
            permanent: fields.checkbox({ label: '301 permanente (desmarcar = 302 temporário)', defaultValue: true }),
          }),
          { label: 'Redirecionamentos', itemLabel: (p) => `${p.fields.source.value} → ${p.fields.destination.value}` },
        ),
      },
    }),

    globalSeo: singleton({
      label: 'SEO e metadados globais',
      path: 'content/global-seo',
      format: 'yaml',
      schema: {
        titleTemplate: fields.text({ label: 'Template do title', defaultValue: '%s | GeraCode' }),
        defaultTitle: fields.text({ label: 'Title padrão (fallback)', defaultValue: 'GeraCode | Gerador de Código de Barras e QR Code Pix Grátis' }),
        defaultDescription: fields.text({ label: 'Meta description padrão', multiline: true }),
        ogLocale: fields.text({ label: 'OG locale', defaultValue: 'pt_BR' }),
        themeColor: fields.text({ label: 'Theme color (hex)', defaultValue: '#4f46e5' }),
        organizationName: fields.text({ label: 'Nome da organização', defaultValue: 'GeraCode' }),
        organizationLogo: fields.text({ label: 'URL do logo', defaultValue: 'https://www.geracodigo.com.br/logo.svg' }),
        organizationFoundingDate: fields.text({ label: 'Data de fundação (YYYY-MM-DD)', defaultValue: '2026-01-01' }),
      },
    }),

    navegacao: singleton({
      label: 'Navegação (header e footer)',
      path: 'content/navegacao',
      format: 'yaml',
      schema: {
        headerLinks: fields.array(
          fields.object({
            href: fields.text({ label: 'URL' }),
            label: fields.text({ label: 'Texto' }),
          }),
          { label: 'Links do header', itemLabel: (p) => p.fields.label.value },
        ),
        footerFerramentas: fields.array(
          fields.object({
            href: fields.text({ label: 'URL' }),
            label: fields.text({ label: 'Texto' }),
          }),
          { label: 'Footer — Ferramentas', itemLabel: (p) => p.fields.label.value },
        ),
        footerConteudo: fields.array(
          fields.object({
            href: fields.text({ label: 'URL' }),
            label: fields.text({ label: 'Texto' }),
          }),
          { label: 'Footer — Conteúdo', itemLabel: (p) => p.fields.label.value },
        ),
        footerInstitucional: fields.array(
          fields.object({
            href: fields.text({ label: 'URL' }),
            label: fields.text({ label: 'Texto' }),
          }),
          { label: 'Footer — Institucional', itemLabel: (p) => p.fields.label.value },
        ),
        footerTagline: fields.text({ label: 'Tagline do rodapé', multiline: true }),
        copyrightText: fields.text({ label: 'Texto de copyright (sem o ano)', defaultValue: 'GeraCode · Ferramentas gratuitas para lojistas brasileiros' }),
      },
    }),
  },

  collections: {
    ferramentas: collection({
      label: 'Ferramentas',
      slugField: 'slug',
      path: 'content/ferramentas/*',
      format: 'yaml',
      schema: {
        slug: fields.text({ label: 'Slug (URL)' }),
        title: fields.text({ label: 'Title Tag' }),
        metaDescription: fields.text({ label: 'Meta Description', multiline: true }),
        ogTitle: fields.text({ label: 'OG Title' }),
        ogDescription: fields.text({ label: 'OG Description', multiline: true }),
        twitterTitle: fields.text({ label: 'Twitter Title' }),
        twitterDescription: fields.text({ label: 'Twitter Description', multiline: true }),
        h1: fields.text({ label: 'H1 da Página' }),
        subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
        privacyBadgeText: fields.text({ label: 'Texto do badge de privacidade', defaultValue: 'Gerado direto no seu navegador. Seus dados nunca saem do seu computador' }),
        badge: fields.text({ label: 'Badge (ex: "Mais popular", "Novo")' }),
        badgeColor: fields.text({ label: 'Cor do Badge (classes Tailwind)' }),
        icon: fields.text({ label: 'Emoji do ícone' }),
        cardDescription: fields.text({ label: 'Descrição no card da home', multiline: true }),
        ordem: fields.integer({ label: 'Ordem de exibição na home' }),

        // SEO avançado
        ogAccent: fields.text({ label: 'Cor de destaque OG image (hex)', defaultValue: '#4f46e5' }),
        keywordPrimaria: fields.text({ label: 'Keyword primária' }),
        keywordsSecundarias: fields.array(fields.text({ label: 'Keyword' }), { label: 'Keywords secundárias', itemLabel: (p) => p.value }),
        dataAtualizacao: fields.text({ label: 'Data de atualização (YYYY-MM-DD)' }),
        canonicalOverride: fields.text({ label: 'Canonical override (vazio = automático)' }),
        robotsNoindex: fields.checkbox({ label: 'Não indexar (noindex)', defaultValue: false }),
        adSlotPrefix: fields.text({ label: 'Prefixo dos ad slots (ex: pix, barcode)' }),

        // Schema JSON-LD
        schemaAppName: fields.text({ label: 'Schema: Nome do app' }),
        schemaAppDescription: fields.text({ label: 'Schema: Descrição do app', multiline: true }),
        schemaFeatureList: fields.array(fields.text({ label: 'Feature' }), { label: 'Schema: Feature list', itemLabel: (p) => p.value }),
        schemaHowToName: fields.text({ label: 'Schema: Nome do HowTo' }),
        schemaHowToDescription: fields.text({ label: 'Schema: Descrição do HowTo', multiline: true }),
        schemaHowToTotalTime: fields.text({ label: 'Schema: Tempo total (ex: PT2M)', defaultValue: 'PT2M' }),
        schemaHowToSteps: fields.array(
          fields.object({
            nome: fields.text({ label: 'Nome do passo' }),
            texto: fields.text({ label: 'Texto do passo', multiline: true }),
          }),
          { label: 'Schema: Passos do HowTo', itemLabel: (p) => p.fields.nome.value },
        ),
        schemaAboutName: fields.text({ label: 'Schema: About (nome do assunto)' }),
        schemaDatePublished: fields.text({ label: 'Schema: Data de publicação (YYYY-MM-DD)' }),
        schemaDateModified: fields.text({ label: 'Schema: Data de modificação (YYYY-MM-DD)' }),

        // Seções de conteúdo editáveis
        secoesConteudo: fields.array(
          fields.object({
            tipo: fields.select({
              label: 'Tipo de seção',
              options: [
                { label: 'Passos (como funciona)', value: 'steps' },
                { label: 'Cards (grid)', value: 'cards' },
                { label: 'Texto (prose/markdown)', value: 'prose' },
                { label: 'Tags (badges)', value: 'tags' },
                { label: 'Links (cards com link)', value: 'links' },
              ],
              defaultValue: 'prose',
            }),
            titulo: fields.text({ label: 'Título da seção (H2)' }),
            subtitulo: fields.text({ label: 'Subtítulo (opcional)', multiline: true }),
            conteudo: fields.text({ label: 'Conteúdo (Markdown/HTML)', multiline: true }),
            stepColor: fields.text({ label: 'Cor dos steps (ex: green, indigo, amber)', defaultValue: 'indigo' }),
            bgCard: fields.checkbox({ label: 'Fundo branco com borda (card style)', defaultValue: false }),
            columns: fields.select({
              label: 'Colunas no grid',
              options: [
                { label: '2 colunas', value: '2' },
                { label: '3 colunas', value: '3' },
                { label: '4 colunas', value: '4' },
              ],
              defaultValue: '3',
            }),
            items: fields.array(
              fields.object({
                titulo: fields.text({ label: 'Título' }),
                descricao: fields.text({ label: 'Descrição', multiline: true }),
                icone: fields.text({ label: 'Ícone/Emoji (opcional)' }),
              }),
              { label: 'Items (cards/steps)', itemLabel: (p) => p.fields.titulo.value },
            ),
            tags: fields.array(
              fields.text({ label: 'Tag' }),
              { label: 'Tags', itemLabel: (p) => p.value },
            ),
            links: fields.array(
              fields.object({
                href: fields.text({ label: 'URL' }),
                label: fields.text({ label: 'Título' }),
                descricao: fields.text({ label: 'Descrição', multiline: true }),
                badgeText: fields.text({ label: 'Badge (ex: Guia, Solução)' }),
                badgeColor: fields.text({ label: 'Cor do badge (classes Tailwind)' }),
              }),
              { label: 'Links', itemLabel: (p) => p.fields.label.value },
            ),
          }),
          { label: 'Seções de conteúdo', itemLabel: (p) => p.fields.titulo.value },
        ),

        // FAQ fallbacks
        faqFallbacks: fields.array(
          fields.object({
            pergunta: fields.text({ label: 'Pergunta' }),
            resposta: fields.text({ label: 'Resposta', multiline: true }),
          }),
          { label: 'FAQs de fallback', itemLabel: (p) => p.fields.pergunta.value },
        ),
      },
    }),

    paginasInstitucionais: collection({
      label: 'Páginas institucionais',
      slugField: 'slug',
      path: 'content/paginas-institucionais/*',
      format: 'yaml',
      schema: {
        slug: fields.text({ label: 'Slug (URL)' }),
        title: fields.text({ label: 'Title Tag' }),
        metaDescription: fields.text({ label: 'Meta Description', multiline: true }),
        h1: fields.text({ label: 'H1 da Página' }),
        subtitulo: fields.text({ label: 'Subtítulo (ex: "Última atualização: abril de 2026")', multiline: true }),
        ogTitle: fields.text({ label: 'OG Title' }),
        ogDescription: fields.text({ label: 'OG Description', multiline: true }),
        twitterTitle: fields.text({ label: 'Twitter Title' }),
        twitterDescription: fields.text({ label: 'Twitter Description', multiline: true }),
        dataAtualizacao: fields.text({ label: 'Data de atualização (YYYY-MM-DD)' }),
        schemaType: fields.select({
          label: 'Tipo de schema',
          options: [
            { label: 'AboutPage', value: 'AboutPage' },
            { label: 'WebPage', value: 'WebPage' },
          ],
          defaultValue: 'WebPage',
        }),
        schemaDatePublished: fields.text({ label: 'Schema: Data de publicação (YYYY-MM-DD)' }),
        schemaDateModified: fields.text({ label: 'Schema: Data de modificação (YYYY-MM-DD)' }),
        breadcrumbLabel: fields.text({ label: 'Label no breadcrumb' }),
        containerWidth: fields.select({
          label: 'Largura máxima do container',
          options: [
            { label: 'Máx. 3xl', value: '3xl' },
            { label: 'Máx. 4xl', value: '4xl' },
          ],
          defaultValue: '3xl',
        }),
        bgCard: fields.checkbox({ label: 'Envolver conteúdo em card branco', defaultValue: true }),
        showMidAd: fields.checkbox({ label: 'Exibir ad slot no meio da página', defaultValue: false }),
        bodyMarkdown: fields.text({ label: 'Corpo (Markdown)', multiline: true }),
        robotsNoindex: fields.checkbox({ label: 'Não indexar (noindex)', defaultValue: false }),
      },
    }),

    faqs: collection({
      label: 'FAQs',
      slugField: 'slug',
      path: 'content/faqs/*',
      format: 'yaml',
      schema: {
        slug: fields.text({ label: 'Slug' }),
        pergunta: fields.text({ label: 'Pergunta' }),
        resposta: fields.text({ label: 'Resposta', multiline: true }),
        pagina: fields.select({
          label: 'Página onde aparece',
          options: [
            { label: 'Home', value: 'home' },
            { label: 'Código de Barras', value: 'codigo-de-barras' },
            { label: 'EAN', value: 'ean' },
            { label: 'QR Code Pix', value: 'qr-code-pix' },
            { label: 'QR Code', value: 'qr-code' },
            { label: 'Leitor', value: 'leitor' },
            { label: 'SKU', value: 'sku' },
          ],
          defaultValue: 'home',
        }),
        ordem: fields.integer({ label: 'Ordem' }),
      },
    }),

    publicosAlvo: collection({
      label: 'Públicos-alvo (home)',
      slugField: 'slug',
      path: 'content/publicos-alvo/*',
      format: 'yaml',
      schema: {
        slug: fields.text({ label: 'Slug' }),
        titulo: fields.text({ label: 'Título' }),
        descricao: fields.text({ label: 'Descrição', multiline: true }),
        ordem: fields.integer({ label: 'Ordem' }),
      },
    }),

    posts: collection({
      label: 'Blog posts',
      slugField: 'slug',
      path: 'content/posts/*',
      format: 'yaml',
      schema: {
        slug: fields.text({ label: 'Slug (URL)' }),
        title: fields.text({ label: 'Title Tag' }),
        metaDescription: fields.text({ label: 'Meta Description', multiline: true }),
        h1: fields.text({ label: 'H1 da Página' }),
        subtitle: fields.text({ label: 'Subtítulo/Dek', multiline: true }),
        resumo: fields.text({ label: 'Resumo/Lead (aparece no card e intro)', multiline: true }),
        categoria: fields.select({
          label: 'Categoria',
          options: [
            { label: 'QR Code Pix', value: 'pix' },
            { label: 'Código de Barras', value: 'codigo-barras' },
            { label: 'EAN', value: 'ean' },
            { label: 'SKU', value: 'sku' },
            { label: 'Leitor', value: 'leitor' },
            { label: 'QR Code', value: 'qr-code' },
            { label: 'Geral', value: 'geral' },
          ],
          defaultValue: 'geral',
        }),
        persona: fields.select({
          label: 'Persona-alvo',
          options: [
            { label: 'MEI / Autônomo', value: 'mei' },
            { label: 'Lojista e-commerce', value: 'lojista-ecommerce' },
            { label: 'Lojista físico', value: 'lojista-fisico' },
            { label: 'Restaurante', value: 'restaurante' },
            { label: 'Desenvolvedor', value: 'dev' },
            { label: 'Geral', value: 'geral' },
          ],
          defaultValue: 'geral',
        }),
        dataPublicacao: fields.text({ label: 'Data de publicação (YYYY-MM-DD)' }),
        dataAtualizacao: fields.text({ label: 'Data de atualização (YYYY-MM-DD)' }),
        autor: fields.text({ label: 'Autor', defaultValue: 'Equipe GeraCode' }),
        tempoLeitura: fields.integer({ label: 'Tempo de leitura (minutos)' }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: (p) => p.value }),
        ferramentaRelacionadaSlug: fields.text({
          label: 'Slug da ferramenta relacionada (CTA principal)',
          description: 'Ex: gerador-de-qr-code-pix',
        }),
        keywordPrimaria: fields.text({ label: 'Keyword primária' }),
        keywordsSecundarias: fields.array(fields.text({ label: 'Keyword' }), { label: 'Keywords secundárias', itemLabel: (p) => p.value }),
        ogTitle: fields.text({ label: 'OG Title' }),
        ogDescription: fields.text({ label: 'OG Description', multiline: true }),
        ogAccent: fields.text({ label: 'Cor de destaque da OG image (hex)', defaultValue: '#4f46e5' }),
        twitterTitle: fields.text({ label: 'Twitter Title' }),
        twitterDescription: fields.text({ label: 'Twitter Description', multiline: true }),
        bodyMarkdown: fields.text({ label: 'Corpo do post (Markdown)', multiline: true }),
        faqsSlugs: fields.array(fields.text({ label: 'FAQ slug' }), { label: 'FAQs relacionadas (slugs da coleção FAQs)', itemLabel: (p) => p.value }),
      },
    }),

    landingsVerticais: collection({
      label: 'Landing pages verticais',
      slugField: 'slug',
      path: 'content/landings-verticais/*',
      format: 'yaml',
      schema: {
        slug: fields.text({ label: 'Slug (URL após /solucoes/)' }),
        segmento: fields.select({
          label: 'Segmento',
          options: [
            { label: 'MEI / Autônomo', value: 'mei' },
            { label: 'Restaurante / Food', value: 'restaurante' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Lojista e-commerce', value: 'lojista-ecommerce' },
            { label: 'Lojista físico', value: 'lojista-fisico' },
            { label: 'Autônomo de serviço', value: 'autonomo-servico' },
          ],
          defaultValue: 'mei',
        }),
        title: fields.text({ label: 'Title Tag' }),
        metaDescription: fields.text({ label: 'Meta Description', multiline: true }),
        h1: fields.text({ label: 'H1 da Página' }),
        subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
        introducao: fields.text({ label: 'Introdução (parágrafo inicial)', multiline: true }),
        heroBeneficios: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Título do benefício' }),
            descricao: fields.text({ label: 'Descrição', multiline: true }),
            icone: fields.text({ label: 'Emoji/Ícone' }),
          }),
          { label: 'Benefícios no hero (3–5)', itemLabel: (p) => p.fields.titulo.value },
        ),
        casosDeUso: fields.array(fields.text({ label: 'Caso de uso' }), { label: 'Casos de uso', itemLabel: (p) => p.value }),
        ferramentaPrincipalSlug: fields.text({ label: 'Slug da ferramenta principal' }),
        ferramentasSecundariasSlugs: fields.array(fields.text({ label: 'Slug' }), { label: 'Ferramentas secundárias (slugs)', itemLabel: (p) => p.value }),
        ctaTexto: fields.text({ label: 'Texto do CTA principal', defaultValue: 'Gerar agora' }),
        postsRelacionadosSlugs: fields.array(fields.text({ label: 'Slug do post' }), { label: 'Posts relacionados (slugs)', itemLabel: (p) => p.value }),
        faqsSlugs: fields.array(fields.text({ label: 'FAQ slug' }), { label: 'FAQs relacionadas (slugs)', itemLabel: (p) => p.value }),
        conteudoExtra: fields.text({ label: 'Conteúdo extra (Markdown, opcional)', multiline: true }),
        keywordPrimaria: fields.text({ label: 'Keyword primária' }),
        ogTitle: fields.text({ label: 'OG Title' }),
        ogDescription: fields.text({ label: 'OG Description', multiline: true }),
        ogAccent: fields.text({ label: 'Cor de destaque da OG image (hex)', defaultValue: '#4f46e5' }),
        twitterTitle: fields.text({ label: 'Twitter Title' }),
        twitterDescription: fields.text({ label: 'Twitter Description', multiline: true }),
        dataAtualizacao: fields.text({ label: 'Data de atualização (YYYY-MM-DD)' }),
      },
    }),

    comparacoes: collection({
      label: 'Páginas de comparação',
      slugField: 'slug',
      path: 'content/comparacoes/*',
      format: 'yaml',
      schema: {
        slug: fields.text({ label: 'Slug (URL após /comparar/)' }),
        termoA: fields.text({ label: 'Termo A (ex: EAN-13)' }),
        termoB: fields.text({ label: 'Termo B (ex: UPC-A)' }),
        title: fields.text({ label: 'Title Tag' }),
        metaDescription: fields.text({ label: 'Meta Description', multiline: true }),
        h1: fields.text({ label: 'H1 da Página' }),
        subtitle: fields.text({ label: 'Subtítulo', multiline: true }),
        introducao: fields.text({ label: 'Introdução (parágrafo inicial)', multiline: true }),
        tabelaComparativa: fields.array(
          fields.object({
            criterio: fields.text({ label: 'Critério' }),
            valorA: fields.text({ label: 'Valor A', multiline: true }),
            valorB: fields.text({ label: 'Valor B', multiline: true }),
          }),
          { label: 'Tabela comparativa (8–12 linhas)', itemLabel: (p) => p.fields.criterio.value },
        ),
        quandoUsarA: fields.text({ label: 'Quando usar A', multiline: true }),
        quandoUsarB: fields.text({ label: 'Quando usar B', multiline: true }),
        veredito: fields.text({ label: 'Veredito / síntese', multiline: true }),
        ferramentasRelacionadasSlugs: fields.array(fields.text({ label: 'Slug' }), { label: 'Ferramentas relacionadas (slugs)', itemLabel: (p) => p.value }),
        faqsSlugs: fields.array(fields.text({ label: 'FAQ slug' }), { label: 'FAQs relacionadas (slugs)', itemLabel: (p) => p.value }),
        postsRelacionadosSlugs: fields.array(fields.text({ label: 'Slug do post' }), { label: 'Posts relacionados (slugs)', itemLabel: (p) => p.value }),
        conteudoExtra: fields.text({ label: 'Conteúdo extra (Markdown)', multiline: true }),
        keywordPrimaria: fields.text({ label: 'Keyword primária' }),
        ogTitle: fields.text({ label: 'OG Title' }),
        ogDescription: fields.text({ label: 'OG Description', multiline: true }),
        ogAccent: fields.text({ label: 'Cor de destaque da OG image (hex)', defaultValue: '#4f46e5' }),
        twitterTitle: fields.text({ label: 'Twitter Title' }),
        twitterDescription: fields.text({ label: 'Twitter Description', multiline: true }),
        dataAtualizacao: fields.text({ label: 'Data de atualização (YYYY-MM-DD)' }),
      },
    }),
  },
})
