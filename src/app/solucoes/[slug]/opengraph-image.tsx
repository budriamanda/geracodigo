import { reader } from '@/lib/content'
import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Solução GeraCode'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const landings = await reader.collections.landingsVerticais.all()
  return landings.map((l) => ({ slug: l.slug }))
}

export default async function OGImage({ params }: Props) {
  const landing = await reader.collections.landingsVerticais.read(params.slug)
  const title = landing?.h1 || landing?.title || 'Soluções GeraCode'
  const description = landing?.subtitle || landing?.metaDescription || 'Ferramentas gratuitas para seu segmento.'
  const accent = landing?.ogAccent || '#10b981'
  return makeOGImage(title, description, accent)
}
