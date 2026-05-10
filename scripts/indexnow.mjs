/**
 * IndexNow submission script.
 *
 * Usage:
 *   node scripts/indexnow.mjs                  # submits all URLs from sitemap
 *   node scripts/indexnow.mjs /blog/new-post   # submits specific paths
 *
 * Run after every deploy: npm run indexnow
 */

import { parseArgs } from 'node:util'

const HOST = 'www.geracodigo.com.br'
const BASE = `https://${HOST}`
const KEY = '4fa3c5a4718546d881f6b1f77cfe62da'
const KEY_LOCATION = `${BASE}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const BATCH_SIZE = 100

const { positionals } = parseArgs({ allowPositionals: true })

async function fetchSitemapUrls() {
  const res = await fetch(`${BASE}/sitemap.xml`)
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`)
  const xml = await res.text()
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  return matches.map((m) => m[1].trim())
}

async function submit(urls) {
  if (urls.length === 0) {
    console.log('No URLs to submit.')
    return
  }

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: batch,
      }),
    })

    const status = res.status
    if (status === 200 || status === 202) {
      console.log(`✓ Submitted ${batch.length} URLs (batch ${Math.floor(i / BATCH_SIZE) + 1}) — HTTP ${status}`)
    } else {
      const body = await res.text()
      console.error(`✗ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed — HTTP ${status}: ${body}`)
    }
  }
}

async function main() {
  let urls

  if (positionals.length > 0) {
    urls = positionals.map((p) => `${BASE}${p.startsWith('/') ? p : '/' + p}`)
    console.log(`Submitting ${urls.length} explicit URL(s)…`)
  } else {
    console.log('Fetching sitemap…')
    urls = await fetchSitemapUrls()
    console.log(`Found ${urls.length} URLs in sitemap.`)
  }

  await submit(urls)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
