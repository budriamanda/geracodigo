import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaMarkup from '@/components/SchemaMarkup'
import { reader } from '@/lib/content'
import { formatDateHuman } from '@/lib/dates'
import { SITE_URL } from '@/lib/constants'

const AUTHOR_SLUG = 'amanda-budri'
const AUTHOR_URL = `${SITE_URL}/autor/${AUTHOR_SLUG}`
const LINKEDIN_URL = 'https://www.linkedin.com/in/amandabudri/'

export const metadata: Metadata = {
  title: 'Amanda Budri — Especialista em SEO | GeraCode',
  description:
    'Conheça Amanda Budri, especialista em SEO com mais de 6 anos de experiência em SEO técnico, growth e conteúdo. Responsável pelo conteúdo e estratégia SEO do GeraCode.',
  alternates: { canonical: AUTHOR_URL },
  openGraph: {
    title: 'Amanda Budri — Especialista em SEO',
    description:
      'Especialista em SEO técnico, growth e conteúdo. Mais de 6 anos de experiência com Nuvemshop, ESCALE e projetos próprios.',
    url: AUTHOR_URL,
    type: 'profile',
    locale: 'pt_BR',
    siteName: 'GeraCode',
  },
  twitter: {
    card: 'summary',
    title: 'Amanda Budri — Especialista em SEO | GeraCode',
    description: 'SEO técnico, growth e conteúdo. Autora dos guias do GeraCode.',
  },
}

const EXPERTISE = [
  'SEO Técnico',
  'Core Web Vitals',
  'Pesquisa de Palavras-chave',
  'SEO On-page',
  'Análise Competitiva',
  'GEO / AIO & LLMs',
  'Google Search Console',
  'Semrush · Ahrefs',
  'Screaming Frog',
  'Growth Marketing',
  'CRO',
  'SEO Internacional',
]

const CERTIFICATIONS = [
  'SEO Manager Certification',
  'Technical SEO Certification',
  'Product Masterclass: How to Build Digital Products',
]

export default async function AutorAmandaBudriPage() {
  const allPosts = await reader.collections.posts.all()

  const posts = allPosts
    .filter((p) => p.entry.autor === 'Amanda Budri')
    .map((p) => ({
      slug: p.slug,
      title: p.entry.title,
      h1: p.entry.h1,
      resumo: p.entry.resumo,
      categoria: p.entry.categoria,
      dataPublicacaoIso: p.entry.dataPublicacao,
      dataPublicacaoHumana: formatDateHuman(p.entry.dataPublicacao),
      tempoLeitura: p.entry.tempoLeitura ?? undefined,
    }))
    .sort((a, b) => (a.dataPublicacaoIso < b.dataPublicacaoIso ? 1 : -1))

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': AUTHOR_URL,
      name: 'Amanda Budri',
      jobTitle: 'Especialista em SEO',
      description:
        'Especialista em SEO com mais de 6 anos de experiência em SEO técnico, pesquisa semântica, growth e análise competitiva. Atua na Nuvemshop e é responsável pelo conteúdo e estratégia SEO do GeraCode.',
      url: AUTHOR_URL,
      sameAs: [LINKEDIN_URL],
      knowsAbout: [
        'SEO técnico',
        'Core Web Vitals',
        'Pesquisa de palavras-chave',
        'QR Code Pix',
        'Código de barras',
        'E-commerce brasileiro',
        'Google Search Console',
        'Análise competitiva',
      ],
      worksFor: {
        '@type': 'Organization',
        name: 'Nuvemshop',
        url: 'https://www.nuvemshop.com.br',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GeraCode', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Amanda Budri', item: AUTHOR_URL },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SchemaMarkup schema={schemas} />
      <Breadcrumb
        current="Amanda Budri"
        trail={[{ label: 'Blog', href: '/blog' }]}
      />

      {/* Header do autor */}
      <section className="mt-6 mb-10">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div
            className="flex-shrink-0 w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold select-none"
            aria-hidden="true"
          >
            AB
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Amanda Budri</h1>
            <p className="text-base text-indigo-600 font-medium mt-1">
              Especialista em SEO | GEO | Tech SEO | Growth Marketing
            </p>
            <p className="text-sm text-gray-500 mt-1">São Paulo, Brasil</p>

            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                <svg className="h-4 w-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-8 prose prose-gray max-w-none text-gray-700 leading-relaxed">
          <p>
            Especialista em SEO com mais de 6 anos de experiência em SEO técnico, pesquisa semântica e growth
            marketing. Atualmente atua como <strong>Especialista em SEO na Nuvemshop</strong>, responsável pela
            aquisição orgânica em todo o domínio, com foco em squads de Growth, Produto e CRO.
          </p>
          <p className="mt-3">
            No GeraCode, é responsável pela estratégia e produção de conteúdo: dos guias técnicos sobre código de
            barras e QR Code Pix aos artigos voltados para MEIs, lojistas e empreendedores brasileiros. Toda a
            abordagem editorial do site parte de <strong>fontes oficiais verificáveis</strong> — especificações do
            Banco Central, GS1 Brasil e normas ISO/IEC — com foco em precisão técnica e utilidade prática.
          </p>
          <p className="mt-3">
            Tem histórico em análises competitivas, auditorias técnicas recorrentes, otimização para AIO &amp; LLMs e
            estratégias de internacionalização. Certificada em SEO Manager, Technical SEO e Digital Products.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Expertise */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Áreas de expertise</h2>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Certificações + Experiência */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certificações</h2>
          <ul className="space-y-2">
            {CERTIFICATIONS.map((cert) => (
              <li key={cert} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
                {cert}
              </li>
            ))}
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Experiência</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>
              <span className="font-medium text-gray-900">Nuvemshop</span>
              <br />
              <span className="text-gray-500">Especialista em SEO · 2021–presente</span>
            </li>
            <li>
              <span className="font-medium text-gray-900">ESCALE</span>
              <br />
              <span className="text-gray-500">Analista de SEO · 2019–2021</span>
            </li>
            <li>
              <span className="font-medium text-gray-900">Loft</span>
              <br />
              <span className="text-gray-500">Link Builder · 2020–2021</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Posts */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Artigos publicados
          {posts.length > 0 && (
            <span className="ml-2 text-base font-normal text-gray-500">({posts.length})</span>
          )}
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <p className="text-gray-500 text-sm">Em breve os artigos aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                >
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                    {post.categoria && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                        {post.categoria}
                      </span>
                    )}
                    {post.tempoLeitura && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {post.tempoLeitura} min
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1">
                    {post.h1 || post.title}
                  </h3>
                  {post.resumo && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.resumo}</p>
                  )}
                  <p className="mt-3 text-xs text-gray-400">
                    <time dateTime={post.dataPublicacaoIso}>{post.dataPublicacaoHumana}</time>
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
