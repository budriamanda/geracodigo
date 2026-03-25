import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Gerador de EAN-13 e EAN-8 Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Gerador de EAN-13 e EAN-8 Grátis',
    'Crie códigos EAN para produtos, e-commerce e varejo. Download imediato.',
    '#f59e0b'
  )
}
