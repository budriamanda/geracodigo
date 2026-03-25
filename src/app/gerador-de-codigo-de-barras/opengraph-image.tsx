import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Gerador de Código de Barras Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Gerador de Código de Barras Grátis',
    'EAN-13, EAN-8, Code 128, Code 39, UPC-A e ISBN. Download PNG e SVG.',
    '#4f46e5'
  )
}
