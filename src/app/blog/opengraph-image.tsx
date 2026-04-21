import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Blog do GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Blog do GeraCode',
    'Guias práticos de QR Code Pix, código de barras, EAN e SKU para lojistas brasileiros.',
    '#4f46e5',
  )
}
