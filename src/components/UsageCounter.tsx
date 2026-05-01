'use client'

import { useState, useEffect } from 'react'
import { getCount } from '@/lib/counter'

export default function UsageCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const n = getCount()
    if (n > 0) setCount(n)
  }, [])

  if (!count) return null

  return (
    <p className="text-sm text-gray-400 mt-3" aria-live="polite">
      {count.toLocaleString('pt-BR')} código{count !== 1 ? 's' : ''} gerado{count !== 1 ? 's' : ''} por você
    </p>
  )
}
