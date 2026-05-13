'use client'

import { useEffect, useState } from 'react'

const FALLBACK = 50_000

export default function SiteCounter() {
  const [count, setCount] = useState<number>(FALLBACK)

  useEffect(() => {
    fetch('/api/counter')
      .then((r) => r.json())
      .then((data: { count: number }) => {
        if (data.count > FALLBACK) setCount(data.count)
      })
      .catch(() => {})
  }, [])

  const formatted = new Intl.NumberFormat('pt-BR').format(count)
  return (
    <p className="text-sm text-gray-500 mt-2">
      Mais de <strong className="text-gray-700">{formatted}</strong> códigos gerados por lojistas brasileiros
    </p>
  )
}
