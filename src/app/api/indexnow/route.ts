import { NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const HOST = 'https://www.geracodigo.com.br'
const SITEMAP_URL = `${HOST}/sitemap.xml`

const ALL_URLS = [
  '/',
  '/gerador-de-qr-code-pix',
  '/gerador-de-codigo-de-barras',
  '/gerador-de-ean',
  '/gerador-de-qr-code',
  '/leitor-de-codigo-de-barras',
  '/leitor-de-qr-code',
  '/gerador-de-sku',
  '/sobre',
  '/termos',
  '/privacidade',
]

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.INDEXNOW_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const rawUrls: unknown[] | null = Array.isArray(body?.urls) ? body.urls : null
  const validPaths = rawUrls
    ?.filter((p): p is string => typeof p === 'string' && p.startsWith('/'))
  const urls = (validPaths && validPaths.length > 0)
    ? validPaths.map((p) => `${HOST}${p}`)
    : ALL_URLS.map((p) => `${HOST}${p}`)

  const payload = {
    host: 'www.geracodigo.com.br',
    key: INDEXNOW_KEY,
    keyLocation: `${HOST}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  }

  const [indexNowRes, googlePingRes] = await Promise.allSettled([
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }),
    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`),
  ])

  return NextResponse.json({
    indexNow: indexNowRes.status === 'fulfilled'
      ? { status: indexNowRes.value.status, submitted: urls.length }
      : { error: 'IndexNow request failed' },
    googlePing: googlePingRes.status === 'fulfilled'
      ? { status: googlePingRes.value.status, sitemap: SITEMAP_URL }
      : { error: 'Google ping failed' },
    urls,
  })
}
