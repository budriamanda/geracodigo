import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import AdSlot from '@/components/AdSlot'
import FAQSection from '@/components/FAQSection'
import SchemaMarkup from '@/components/SchemaMarkup'
import RelatedTools from '@/components/RelatedTools'
import Breadcrumb from '@/components/Breadcrumb'
import LastUpdated from '@/components/LastUpdated'
import GeneratorSkeleton from '@/components/GeneratorSkeleton'
import ToolEngagementTracker from '@/components/ToolEngagementTracker'
import ToolPageSections, { type ContentSection } from '@/components/ToolPageSections'
import { LAST_UPDATED, LAST_UPDATED_ISO, SITE_URL } from '@/lib/constants'
import { reader } from '@/lib/content'
import { buildToolSchemas } from '@/lib/tool-schemas'

const SLUG = 'gerador-de-qr-code-pix'
const PixGenerator = dynamic(() => import('./PixGenerator'), {
  loading: () => <GeneratorSkeleton />,
})

export async function generateMetadata(): Promise<Metadata> {
  const tool = await reader.collections.ferramentas.read(SLUG)
  const canonical = tool?.canonicalOverride?.trim() || `${SITE_URL}/${SLUG}`
  return {
    title: tool?.title ?? 'Gerador de QR Code Pix Grátis | Crie seu QR Pix',
    description: tool?.metaDescription ?? '',
    alternates: { canonical },
    ...(tool?.robotsNoindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: tool?.ogTitle ?? tool?.title ?? '',
      description: tool?.ogDescription ?? tool?.metaDescription ?? '',
      url: canonical,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: `/${SLUG}/opengraph-image`, width: 1200, height: 630, alt: tool?.ogTitle ?? 'Gerador de QR Code Pix Grátis | GeraCode' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: tool?.twitterTitle ?? tool?.title ?? '',
      description: tool?.twitterDescription ?? tool?.metaDescription ?? '',
      images: [`/${SLUG}/opengraph-image`],
    },
  }
}

export default async function PixPage() {
  const [tool, faqsAll] = await Promise.all([
    reader.collections.ferramentas.read(SLUG),
    reader.collections.faqs.all(),
  ])
  if (!tool) throw new Error(`Ferramenta não encontrada: ${SLUG}`)

  const faqs = faqsAll
    .filter((f) => f.entry.pagina === 'qr-code-pix')
    .sort((a, b) => (a.entry.ordem ?? 0) - (b.entry.ordem ?? 0))
    .map((f) => ({ question: f.entry.pergunta, answer: f.entry.resposta }))

  const displayFaqs = faqs.length > 0
    ? faqs
    : (tool.faqFallbacks || []).map((f) => ({ question: f.pergunta, answer: f.resposta }))

  const schemas = buildToolSchemas({
    slug: SLUG,
    h1: tool.h1,
    schemaAppName: tool.schemaAppName,
    schemaAppDescription: tool.schemaAppDescription,
    schemaFeatureList: tool.schemaFeatureList as string[] | undefined,
    schemaHowToName: tool.schemaHowToName,
    schemaHowToDescription: tool.schemaHowToDescription,
    schemaHowToTotalTime: tool.schemaHowToTotalTime,
    schemaHowToSteps: tool.schemaHowToSteps as { nome: string; texto: string }[] | undefined,
    schemaAboutName: tool.schemaAboutName,
    schemaDatePublished: tool.schemaDatePublished,
    schemaDateModified: tool.schemaDateModified,
  })

  const adPrefix = tool.adSlotPrefix || 'pix'
  const sections = (tool.secoesConteudo || []) as unknown as ContentSection[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToolEngagementTracker toolName="pix_generator" />
      <SchemaMarkup schema={schemas} />
      <div className="flex justify-center mb-6">
        <AdSlot slot={`${adPrefix}-top`} format="horizontal" />
      </div>

      <Breadcrumb current="Gerador de QR Code Pix" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.h1}</h1>
        <p className="text-gray-600">{tool.subtitle}</p>
        {tool.privacyBadgeText && (
          <p className="text-sm text-indigo-600 mt-1"><span aria-hidden="true">{'\u{1F512}'}</span> {tool.privacyBadgeText}</p>
        )}
        <LastUpdated date={LAST_UPDATED} isoDate={tool.dataAtualizacao || LAST_UPDATED_ISO} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <PixGenerator />
        </div>
        <aside className="lg:w-[300px] flex flex-col items-center lg:items-start gap-6">
          <AdSlot slot={`${adPrefix}-sidebar`} format="rectangle" />
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800" aria-labelledby="info-cobrancas">
            <h3 id="info-cobrancas" className="font-semibold mb-1"><span aria-hidden="true">ℹ️</span> Cobranças Estáticas</h3>
            <p>Este QR gera cobranças estáticas (sem confirmação automática). Para cobranças com notificação, use a API Pix do seu banco.</p>
          </section>
        </aside>
      </div>

      <div className="flex justify-center mt-8">
        <AdSlot slot={`${adPrefix}-bottom`} format="horizontal" />
      </div>

      <ToolPageSections sections={sections} />

      <div className="flex justify-center mt-16">
        <AdSlot slot={`${adPrefix}-mid`} format="responsive" />
      </div>

      <FAQSection items={displayFaqs} />

      <RelatedTools currentPath={`/${SLUG}`} />
    </div>
  )
}
