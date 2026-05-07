import { describe, it, expect, beforeEach } from 'vitest'
import { memoryBackend } from '@/lib/storage/typed-store'

// ---------------------------------------------------------------------------
// Estratégia: window.localStorage é substituído por um memoryBackend antes
// de cada teste. Isso isola os testes sem mocks de módulo complexos,
// e valida que o barcode-history.ts usa localStorage corretamente.
// ---------------------------------------------------------------------------

const storage = memoryBackend()

// Injeta o backend em memória como localStorage global (limpo a cada teste)
Object.defineProperty(globalThis, 'window', { value: globalThis, writable: true, configurable: true })
Object.defineProperty(globalThis, 'localStorage', {
  get: () => storage,
  configurable: true,
})

const { getHistory, addToHistory, removeFromHistory, clearHistory } =
  await import('./barcode-history')

describe('barcode-history', () => {
  beforeEach(() => {
    // Limpa storage entre testes
    const all = ['geracode_barcode_history']
    for (const key of all) storage.removeItem(key)
  })

  describe('getHistory', () => {
    it('returns empty array when no history exists', () => {
      expect(getHistory()).toEqual([])
    })

    it('returns parsed items after addToHistory', () => {
      addToHistory('7891234567890', 'EAN13')
      const history = getHistory()
      expect(history).toHaveLength(1)
      expect(history[0].value).toBe('7891234567890')
      expect(history[0].format).toBe('EAN13')
    })
  })

  describe('addToHistory', () => {
    it('prepends new items (most recent first)', () => {
      addToHistory('AAA', 'CODE128')
      addToHistory('BBB', 'CODE128')
      const history = getHistory()
      expect(history[0].value).toBe('BBB')
      expect(history[1].value).toBe('AAA')
    })

    it('deduplicates by value+format and moves to top', () => {
      addToHistory('AAA', 'CODE128')
      addToHistory('BBB', 'CODE128')
      addToHistory('AAA', 'CODE128')
      const history = getHistory()
      expect(history).toHaveLength(2)
      expect(history[0].value).toBe('AAA')
    })

    it('allows same value with different format', () => {
      addToHistory('123', 'CODE128')
      addToHistory('123', 'EAN13')
      expect(getHistory()).toHaveLength(2)
    })

    it('limits history to 30 items', () => {
      for (let i = 0; i < 35; i++) addToHistory(`code-${i}`, 'CODE128')
      const history = getHistory()
      expect(history).toHaveLength(30)
      expect(history[0].value).toBe('code-34')
    })
  })

  describe('removeFromHistory', () => {
    it('removes an item by id', () => {
      addToHistory('AAA', 'CODE128')
      const id = getHistory()[0].id
      removeFromHistory(id)
      expect(getHistory()).toHaveLength(0)
    })

    it('does nothing for non-existent id', () => {
      addToHistory('AAA', 'CODE128')
      removeFromHistory('fake-id')
      expect(getHistory()).toHaveLength(1)
    })
  })

  describe('clearHistory', () => {
    it('removes all history', () => {
      addToHistory('AAA', 'CODE128')
      addToHistory('BBB', 'EAN13')
      clearHistory()
      expect(getHistory()).toEqual([])
    })
  })
})
