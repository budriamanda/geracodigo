'use client'

import Link from 'next/link'
import { trackCtaClick, type ToolName } from '@/lib/analytics'

interface CTAFerramentaProps {
  /** Caminho da ferramenta (ex: "/gerador-de-qr-code-pix"). */
  href: string
  /** Título curto exibido no card (ex: "Gerador de QR Code Pix"). */
  titulo: string
  /** Texto secundário/descrição. */
  descricao?: string
  /** Texto do botão (ex: "Gerar meu QR Pix agora"). */
  ctaTexto?: string
  /** ToolName p/ analytics (opcional — se informado, conta no estado da ferramenta). */
  tool?: ToolName
  /** ID semântico usado no evento (ex: "blog_post_cta_top"). */
  ctaId: string
  /** Variação visual. */
  variant?: 'primary' | 'soft' | 'inline'
}

const variantStyles: Record<NonNullable<CTAFerramentaProps['variant']>, { card: string; button: string }> = {
  primary: {
    card: 'bg-indigo-600 text-white border-indigo-600',
    button: 'bg-white text-indigo-700 hover:bg-indigo-50',
  },
  soft: {
    card: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
  inline: {
    card: 'bg-white border-gray-200 text-gray-900',
    button: 'bg-indigo-600 text-white hover:bg-indigo-700',
  },
}

export default function CTAFerramenta({
  href,
  titulo,
  descricao,
  ctaTexto = 'Usar ferramenta grátis',
  tool,
  ctaId,
  variant = 'soft',
}: CTAFerramentaProps) {
  const styles = variantStyles[variant]
  const isOnDark = variant === 'primary'
  return (
    <aside
      className={`my-8 rounded-xl border p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 ${styles.card}`}
      aria-label="Chamada para ferramenta"
    >
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-lg ${isOnDark ? 'text-white' : 'text-gray-900'}`}>{titulo}</p>
        {descricao && (
          <p className={`text-sm mt-1 ${isOnDark ? 'text-indigo-100' : 'text-gray-600'}`}>{descricao}</p>
        )}
      </div>
      <Link
        href={href}
        onClick={() => trackCtaClick(tool, ctaId, ctaTexto)}
        className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${styles.button}`}
      >
        {ctaTexto}
      </Link>
    </aside>
  )
}
