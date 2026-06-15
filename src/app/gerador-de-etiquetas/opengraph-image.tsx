import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Gerador de Etiquetas de Produto Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Gerador de Etiquetas de Produto',
    'Nome, preço e código de barras. Download PNG ou PDF. Grátis.',
    '#059669'
  )
}
