import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Leitor de QR Code Online Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Leitor de QR Code Online',
    'Escaneie QR Code pela câmera do celular ou computador. Sem app, sem cadastro.',
    '#0ea5e9'
  )
}
