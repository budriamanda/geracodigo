/**
 * Formata uma data ISO (YYYY-MM-DD) em texto humano em pt-BR,
 * sem depender de `toLocaleDateString` do runtime (evita diferenças
 * server/client e problemas em edge runtime).
 *
 * Ex: "2026-04-15" -> "15 de abril de 2026"
 */
const MESES_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function formatDateHuman(iso: string | undefined | null): string {
  if (!iso) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const [, yyyy, mm, dd] = match
  const dia = parseInt(dd, 10)
  const mes = MESES_PT[parseInt(mm, 10) - 1]
  if (!mes) return iso
  return `${dia} de ${mes} de ${yyyy}`
}

export function isoOrFallback(iso: string | undefined | null, fallback: string): string {
  if (!iso) return fallback
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso : fallback
}
