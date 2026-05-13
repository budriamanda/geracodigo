import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const COUNTER_KEY = 'geracodigo:total_generated'

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function GET() {
  const redis = getRedis()
  if (!redis) return NextResponse.json({ count: 0 })
  const count = (await redis.get<number>(COUNTER_KEY)) ?? 0
  return NextResponse.json({ count })
}

export async function POST(request: Request) {
  const redis = getRedis()
  if (!redis) return NextResponse.json({ count: 0 })
  const { amount = 1 } = await request.json().catch(() => ({}))
  const count = await redis.incrby(COUNTER_KEY, Math.max(1, Number(amount)))
  return NextResponse.json({ count })
}
