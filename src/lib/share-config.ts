import { SITE_URL } from '@/lib/constants'

export interface ShareConfig {
  toolSlug: string
  whatsappText: string
  shareUrl: string
}

const configs: Record<string, ShareConfig> = {
  'gerador-de-qr-code-pix': {
    toolSlug: 'gerador-de-qr-code-pix',
    whatsappText: `Ei, achei essa ferramenta gratuita pra gerar QR Code Pix, serve pra receber sem maquininha: ${SITE_URL}/gerador-de-qr-code-pix?utm_source=whatsapp&utm_medium=share&utm_campaign=pix`,
    shareUrl: `${SITE_URL}/gerador-de-qr-code-pix?utm_source=copy&utm_medium=share&utm_campaign=pix`,
  },
  'gerador-de-codigo-de-barras': {
    toolSlug: 'gerador-de-codigo-de-barras',
    whatsappText: `Gerador gratuito de código de barras EAN e Code 128, funciona no celular e gera em lote: ${SITE_URL}/gerador-de-codigo-de-barras?utm_source=whatsapp&utm_medium=share&utm_campaign=barcode`,
    shareUrl: `${SITE_URL}/gerador-de-codigo-de-barras?utm_source=copy&utm_medium=share&utm_campaign=barcode`,
  },
  'gerador-de-ean': {
    toolSlug: 'gerador-de-ean',
    whatsappText: `Gerador gratuito de código EAN-13 e EAN-8 pra produtos: ${SITE_URL}/gerador-de-ean?utm_source=whatsapp&utm_medium=share&utm_campaign=ean`,
    shareUrl: `${SITE_URL}/gerador-de-ean?utm_source=copy&utm_medium=share&utm_campaign=ean`,
  },
  'gerador-de-qr-code': {
    toolSlug: 'gerador-de-qr-code',
    whatsappText: `Gerador de QR Code gratuito, gera instantaneamente no celular: ${SITE_URL}/gerador-de-qr-code?utm_source=whatsapp&utm_medium=share&utm_campaign=qrcode`,
    shareUrl: `${SITE_URL}/gerador-de-qr-code?utm_source=copy&utm_medium=share&utm_campaign=qrcode`,
  },
  'gerador-de-sku': {
    toolSlug: 'gerador-de-sku',
    whatsappText: `Gerador de SKU gratuito pra organizar estoque: ${SITE_URL}/gerador-de-sku?utm_source=whatsapp&utm_medium=share&utm_campaign=sku`,
    shareUrl: `${SITE_URL}/gerador-de-sku?utm_source=copy&utm_medium=share&utm_campaign=sku`,
  },
  'leitor-de-codigo-de-barras': {
    toolSlug: 'leitor-de-codigo-de-barras',
    whatsappText: `Leitor de código de barras gratuito, usa a câmera do celular sem instalar nada: ${SITE_URL}/leitor-de-codigo-de-barras?utm_source=whatsapp&utm_medium=share&utm_campaign=reader`,
    shareUrl: `${SITE_URL}/leitor-de-codigo-de-barras?utm_source=copy&utm_medium=share&utm_campaign=reader`,
  },
}

export function getShareConfig(toolSlug: string): ShareConfig {
  return configs[toolSlug] ?? {
    toolSlug,
    whatsappText: `Ferramentas gratuitas para lojistas: ${SITE_URL}?utm_source=whatsapp&utm_medium=share&utm_campaign=generic`,
    shareUrl: `${SITE_URL}?utm_source=copy&utm_medium=share&utm_campaign=generic`,
  }
}
