import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const COUNTER_KEY = 'geracodigo:total_generated'
const RATE_LIMIT_MAX = 60   // máximo de incrementos por IP por janela
const RATE_LIMIT_TTL = 60   // janela em segundos

function getRedis(): Redis | null {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    if (!url || !token) return null
    return new Redis({ url, token })
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const redis = getRedis()
    if (!redis) return NextResponse.json({ count: 0 })
    const count = (await redis.get<number>(COUNTER_KEY)) ?? 0
    return NextResponse.json({ count })
  } catch (err) {
    console.error('[counter] GET error:', err)
    return NextResponse.json({ count: 0 })
  }
}

export async function POST(request: Request) {
  try {
    const redis = getRedis()
    if (!redis) return NextResponse.json({ count: 0 })

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const rateLimitKey = `geracodigo:rl:counter:${ip}`
    const requests = await redis.incr(rateLimitKey)
    if (requests === 1) await redis.expire(rateLimitKey, RATE_LIMIT_TTL)
    if (requests > RATE_LIMIT_MAX) {
      return NextResponse.json({ count: 0 }, { status: 429 })
    }

    const { amount = 1 } = await request.json().catch(() => ({}))
    const parsed = parseInt(String(amount), 10)
    const increment = Number.isFinite(parsed) && parsed > 0 ? parsed : 1
    const count = await redis.incrby(COUNTER_KEY, increment)
    return NextResponse.json({ count })
  } catch (err) {
    console.error('[counter] POST error:', err)
    return NextResponse.json({ count: 0 })
  }
}
