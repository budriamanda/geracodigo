import { reader } from '@/lib/content'
import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Comparação GeraCode'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const items = await reader.collections.comparacoes.all()
  return items.map((c) => ({ slug: c.slug }))
}

export default async function OGImage({ params }: Props) {
  const item = await reader.collections.comparacoes.read(params.slug)
  const title = item?.h1 || item?.title || 'Comparação'
  const description = item?.subtitle || item?.metaDescription || `${item?.termoA} vs ${item?.termoB}`
  const accent = item?.ogAccent || '#f59e0b'
  return makeOGImage(title, description, accent)
}
