export interface SkuConfig {
  prefix: string
  category: string
  attributes: string[]
  sequential: number
  separator: string
}

function sanitize(str: string): string {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '')
}

export function generateSku(config: SkuConfig): string {
  const parts: string[] = []

  if (config.prefix.trim()) {
    parts.push(sanitize(config.prefix).slice(0, 4))
  }
  if (config.category.trim()) {
    parts.push(sanitize(config.category).slice(0, 4))
  }
  for (const attr of config.attributes) {
    if (attr.trim()) {
      parts.push(sanitize(attr).slice(0, 4))
    }
  }
  if (config.sequential > 0) {
    const seq = config.sequential.toString()
    parts.push(seq.length < 4 ? seq.padStart(4, '0') : seq)
  }

  return parts.join(config.separator ?? '-')
}

export function generateSkuBatch(
  config: SkuConfig,
  count: number,
): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    results.push(generateSku({ ...config, sequential: config.sequential + i }))
  }
  return results
}
