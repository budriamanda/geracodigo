import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE = 'https://www.geracodigo.com.br'

const pages: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/gerador-de-qr-code-pix', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/gerador-de-codigo-de-barras', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/gerador-de-ean', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/gerador-de-qr-code', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/leitor-de-codigo-de-barras', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/gerador-de-sku', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/sobre', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacidade', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/termos', changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date().toISOString()

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
