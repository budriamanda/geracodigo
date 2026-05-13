'use client'

import { useEffect, useState } from 'react'

const FALLBACK = 50_000
const REAL_THRESHOLD = 100

export default function SiteCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/counter')
      .then((r) => r.json())
      .then((data: { count: number }) => {
        setCount(data.count >= REAL_THRESHOLD ? data.count : FALLBACK)
      })
      .catch(() => setCount(FALLBACK))
  }, [])

  if (count === null) return null

  const formatted = new Intl.NumberFormat('pt-BR').format(count)
  return (
    <p className="text-sm text-gray-500 mt-2">
      Mais de <strong className="text-gray-700">{formatted}</strong> códigos gerados por lojistas brasileiros
    </p>
  )
}
