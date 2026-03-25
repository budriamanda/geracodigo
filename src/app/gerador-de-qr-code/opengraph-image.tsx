import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Gerador de QR Code Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Gerador de QR Code Grátis',
    'Links, textos, Pix e qualquer conteúdo. Color picker incluso. Sem cadastro.',
    '#0ea5e9'
  )
}
