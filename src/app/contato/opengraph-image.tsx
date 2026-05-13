import { makeOGImage, ogSize, ogContentType } from '@/lib/og-image'

export const size = ogSize
export const contentType = ogContentType
export const runtime = 'edge'
export const alt = 'Contato | GeraCode — Ferramentas Gratuitas para Lojistas'

export default function OGImage() {
  return makeOGImage(
    'Fale com o GeraCode',
    'Dúvidas, erros, sugestões ou parcerias — respondemos em até 2 dias úteis.'
  )
}
