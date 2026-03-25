import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'GeraCode | Gerador de Código de Barras e QR Code Pix'

export default function OGImage() {
  return makeOGImage(
    'Gerador de Código de Barras e QR Code Pix',
    'Ferramentas gratuitas para lojistas brasileiros. Sem cadastro, sem servidor.'
  )
}
