import { createStore } from '@/lib/storage/typed-store'

const MAX_ITEMS = 30

export interface BarcodeHistoryItem {
  id: string
  value: string
  format: string
  createdAt: number
}

function isValidItem(item: unknown): item is BarcodeHistoryItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as BarcodeHistoryItem).id === 'string' &&
    typeof (item as BarcodeHistoryItem).value === 'string' &&
    typeof (item as BarcodeHistoryItem).format === 'string' &&
    typeof (item as BarcodeHistoryItem).createdAt === 'number'
  )
}

const historyStore = createStore<BarcodeHistoryItem[]>({
  key: 'geracode_barcode_history',
  defaultValue: [],
  validate: (v): v is BarcodeHistoryItem[] => Array.isArray(v) && v.every(isValidItem),
})

export function getHistory(): BarcodeHistoryItem[] {
  return historyStore.get()
}

export function addToHistory(value: string, format: string): void {
  historyStore.update(items => {
    const deduped = items.filter(i => !(i.value === value && i.format === format))
    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        value,
        format,
        createdAt: Date.now(),
      },
      ...deduped,
    ]
    return next.length > MAX_ITEMS ? next.slice(0, MAX_ITEMS) : next
  })
}

export function removeFromHistory(id: string): void {
  historyStore.update(items => items.filter(i => i.id !== id))
}

export function clearHistory(): void {
  historyStore.clear()
}
