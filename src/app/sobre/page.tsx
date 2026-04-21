import type { Metadata } from 'next'
import { reader } from '@/lib/content'
import { SITE_URL } from '@/lib/constants'
import InstitucionalLayout from '@/components/InstitucionalLayout'

const SLUG = 'sobre'

export async function generateMetadata(): Promise<Metadata> {
  const page = await reader.collections.paginasInstitucionais.read(SLUG)
  const url = `${SITE_URL}/${SLUG}`
  return {
    title: page?.title ?? '',
    description: page?.metaDescription ?? '',
    alternates: { canonical: url },
    ...(page?.robotsNoindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: page?.ogTitle ?? page?.title ?? '',
      description: page?.ogDescription ?? page?.metaDescription ?? '',
      url,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'GeraCode',
      images: [{ url: `/${SLUG}/opengraph-image`, width: 1200, height: 630, alt: page?.ogTitle ?? '' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page?.twitterTitle ?? page?.title ?? '',
      description: page?.twitterDescription ?? page?.metaDescription ?? '',
      images: [`/${SLUG}/opengraph-image`],
    },
  }
}

export default async function SobrePage() {
  const page = await reader.collections.paginasInstitucionais.read(SLUG)
  if (!page) throw new Error(`Página institucional não encontrada: ${SLUG}`)
  return <InstitucionalLayout page={{ ...page, slug: SLUG }} />
}
