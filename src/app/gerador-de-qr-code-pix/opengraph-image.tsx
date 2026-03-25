import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Gerador de QR Code Pix Grátis | GeraCode'

export default function OGImage() {
  return makeOGImage(
    'Gerador de QR Code Pix Grátis',
    'Payload BR Code EMV válido. CPF, CNPJ, e-mail ou chave aleatória. Sem cadastro.',
    '#10b981'
  )
}
