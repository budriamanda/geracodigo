'use client'

import { useState } from 'react'

interface CopyPayloadButtonProps {
  payload: string
}

export default function CopyPayloadButton({ payload }: CopyPayloadButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback manual selection
    }
  }

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <textarea
          readOnly
          value={payload}
          className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 h-24 resize-none focus:outline-none"
          aria-label="Código Pix (payload BR Code)"
        />
      </div>
      <button
        onClick={handleCopy}
        className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
          copied
            ? 'bg-green-600 text-white'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {copied ? '✓ Código copiado!' : 'Copiar código Pix'}
      </button>
    </div>
  )
}
