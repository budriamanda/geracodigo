import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Gerador de SKU Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Gerador de SKU Grátis',
    'Crie códigos SKU padronizados para organizar seu estoque. Lote e CSV.',
    '#7c3aed'
  )
}
