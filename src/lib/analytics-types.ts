export type ToolName =
  | 'barcode_generator'
  | 'ean_generator'
  | 'qr_code_generator'
  | 'pix_generator'
  | 'barcode_reader'
  | 'qr_reader'
  | 'sku_generator'
  | 'etiqueta_generator'

/** Categoria para públicos e relatórios GA4 */
export const TOOL_CATEGORY: Record<ToolName, 'generator' | 'reader' | 'utility'> = {
  barcode_generator: 'generator',
  ean_generator: 'generator',
  qr_code_generator: 'generator',
  pix_generator: 'generator',
  barcode_reader: 'reader',
  qr_reader: 'reader',
  sku_generator: 'utility',
  etiqueta_generator: 'generator',
}
