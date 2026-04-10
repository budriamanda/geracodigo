'use client'

import { useEffect, useRef, useCallback } from 'react'

interface AdSlotProps {
  slot: string
  format: 'horizontal' | 'rectangle' | 'responsive'
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

const layoutMap: Record<AdSlotProps['format'], { style: React.CSSProperties }> = {
  horizontal: {
    style: { display: 'block', width: '100%', height: '90px', contain: 'layout size' },
  },
  rectangle: {
    style: { display: 'block', width: '300px', height: '250px', contain: 'layout size' },
  },
  responsive: {
    style: { display: 'block', width: '100%', minHeight: '100px', contain: 'layout size' },
  },
}

const placeholderDimensions = {
  horizontal: { width: '100%', height: '90px', label: '728x90' },
  rectangle: { width: '300px', height: '250px', label: '300x250' },
  responsive: { width: '100%', height: '90px', label: 'Responsivo' },
}

export default function AdSlot({ slot, format }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  const tryPush = useCallback(() => {
    if (pushed.current || !adRef.current) return true
    try {
      const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle
      if (adsbygoogle) {
        adsbygoogle.push({})
        pushed.current = true
        return true
      }
    } catch {
      /* AdSense not loaded yet */
    }
    return false
  }, [])

  useEffect(() => {
    if (!ADSENSE_CLIENT) return
    if (tryPush()) return

    let attempts = 0
    const maxAttempts = 10
    const interval = setInterval(() => {
      attempts++
      if (tryPush() || attempts >= maxAttempts) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tryPush])

  if (!ADSENSE_CLIENT) {
    const dim = placeholderDimensions[format]
    return (
      <div
        aria-hidden="true"
        className="flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 text-gray-400 text-xs rounded"
        style={{
          width: dim.width,
          height: dim.height,
          maxWidth: '100%',
          contain: 'layout size',
        }}
        data-slot={slot}
        data-format={format}
      >
        Publicidade {dim.label}
      </div>
    )
  }

  const layout = layoutMap[format]

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={layout.style}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format === 'responsive' ? 'auto' : undefined}
      data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
    />
  )
}
