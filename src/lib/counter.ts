const STORAGE_KEY = 'geracode_total_generated'

export function getCount(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10) || 0
}

export function incrementCount(amount = 1): number {
  const next = getCount() + amount
  localStorage.setItem(STORAGE_KEY, String(next))
  return next
}
