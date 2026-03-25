import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Leitor de Código de Barras Online Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Leitor de Código de Barras Online',
    'Leia códigos de barras e QR Codes pela câmera do celular. Sem app, sem cadastro.',
    '#059669'
  )
}
