import { MetadataRoute } from 'next'
import { reader } from '@/lib/content'
import { isoOrFallback } from '@/lib/dates'

export const dynamic = 'force-static'

const BASE = 'https://www.geracodigo.com.br'
const DEFAULT_LAST_MODIFIED = '2026-03-27'

const staticPages: Array<{
  path: string
  lastModified: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}> = [
  { path: '', lastModified: '2026-03-27', changeFrequency: 'weekly', priority: 1 },
  { path: '/gerador-de-qr-code-pix', lastModified: '2026-03-27', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/gerador-de-codigo-de-barras', lastModified: '2026-03-27', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/gerador-de-ean', lastModified: '2026-03-01', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/gerador-de-qr-code', lastModified: '2026-03-01', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/leitor-de-codigo-de-barras', lastModified: '2026-03-27', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/gerador-de-sku', lastModified: '2026-03-27', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/blog', lastModified: '2026-03-27', changeFrequency: 'daily', priority: 0.9 },
  { path: '/sobre', lastModified: '2026-03-01', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacidade', lastModified: '2026-01-15', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/termos', lastModified: '2026-01-15', changeFrequency: 'yearly', priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, landings, comparacoes] = await Promise.all([
    reader.collections.posts.all(),
    reader.collections.landingsVerticais.all(),
    reader.collections.comparacoes.all(),
  ])

  const entries: MetadataRoute.Sitemap = staticPages.map(({ path, lastModified, changeFrequency, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(lastModified),
    changeFrequency,
    priority,
  }))

  for (const p of posts) {
    const last = isoOrFallback(p.entry.dataAtualizacao || p.entry.dataPublicacao, DEFAULT_LAST_MODIFIED)
    entries.push({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(last),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  for (const l of landings) {
    const last = isoOrFallback(l.entry.dataAtualizacao, DEFAULT_LAST_MODIFIED)
    entries.push({
      url: `${BASE}/solucoes/${l.slug}`,
      lastModified: new Date(last),
      changeFrequency: 'monthly',
      priority: 0.85,
    })
  }

  for (const c of comparacoes) {
    const last = isoOrFallback(c.entry.dataAtualizacao, DEFAULT_LAST_MODIFIED)
    entries.push({
      url: `${BASE}/comparar/${c.slug}`,
      lastModified: new Date(last),
      changeFrequency: 'monthly',
      priority: 0.75,
    })
  }

  return entries
}
