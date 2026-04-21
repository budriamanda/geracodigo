import { reader } from '@/lib/content'
import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Post do blog do GeraCode'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await reader.collections.posts.all()
  return posts.map((p) => ({ slug: p.slug }))
}

export default async function OGImage({ params }: Props) {
  const post = await reader.collections.posts.read(params.slug)
  const title = post?.h1 || post?.title || 'Blog do GeraCode'
  const description = post?.resumo || post?.subtitle || post?.metaDescription || 'Guias práticos para lojistas, MEIs e restaurantes brasileiros.'
  const accent = post?.ogAccent || '#4f46e5'
  return makeOGImage(title, description, accent)
}
