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
        badge: fields.text({ label: 'Badge (ex: "Mais popular", "Novo")' }),
        badgeColor: fields.text({ label: 'Cor do Badge (classes Tailwind)' }),
        icon: fields.text({ label: 'Emoji do ícone' }),
        cardDescription: fields.text({ label: 'Descrição no card da home', multiline: true }),
        ordem: fields.integer({ label: 'Ordem de exibição na home' }),
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
  },
})
