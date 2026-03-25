import { NextResponse } from 'next/server'

const INDEXNOW_KEY = 'dc2556c8e22e4d389f91329f8d9b9ceb'
const HOST = 'https://www.geracodigo.com.br'
const SITEMAP_URL = `${HOST}/sitemap.xml`

const ALL_URLS = [
  '/',
  '/gerador-de-qr-code-pix',
  '/gerador-de-codigo-de-barras',
  '/gerador-de-ean',
  '/gerador-de-qr-code',
  '/leitor-de-codigo-de-barras',
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

  const [indexNowRes, googlePingRes] = await Promise.all([
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }),
    fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`),
  ])

  return NextResponse.json({
    indexNow: { status: indexNowRes.status, submitted: urls.length },
    googlePing: { status: googlePingRes.status, sitemap: SITEMAP_URL },
    urls,
  })
}
