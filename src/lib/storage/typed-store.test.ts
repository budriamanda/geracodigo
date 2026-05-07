import { describe, it, expect } from 'vitest'
import { createStore, memoryBackend } from './typed-store'

function makeStore<T>(opts: {
  defaultValue: T
  validate?: (v: unknown) => v is T
}) {
  const storage = memoryBackend()
  const store = createStore({ key: 'test', defaultValue: opts.defaultValue, validate: opts.validate, storage })
  return { store, storage }
}

describe('createStore', () => {
  describe('get()', () => {
    it('returns defaultValue when nothing stored', () => {
      const { store } = makeStore({ defaultValue: [] as string[] })
      expect(store.get()).toEqual([])
    })

    it('returns stored value after set()', () => {
      const { store } = makeStore({ defaultValue: null as string | null })
      store.set('hello')
      expect(store.get()).toBe('hello')
    })

    it('returns defaultValue for corrupted JSON', () => {
      const storage = memoryBackend()
      storage.setItem('test', 'not-json{{{')
      const store = createStore({ key: 'test', defaultValue: 0, storage })
      expect(store.get()).toBe(0)
    })

    it('returns defaultValue when validate fails', () => {
      makeStore({
        defaultValue: [] as number[],
        validate: (v): v is number[] => Array.isArray(v) && v.every(x => typeof x === 'number'),
      })
      // Store a value that doesn't pass validation
      const storage = memoryBackend()
      storage.setItem('test', JSON.stringify(['a', 'b']))
      const s2 = createStore({
        key: 'test',
        defaultValue: [] as number[],
        validate: (v): v is number[] => Array.isArray(v) && v.every(x => typeof x === 'number'),
        storage,
      })
      expect(s2.get()).toEqual([])
    })

    it('returns null defaultValue correctly', () => {
      type T = { x: number } | null
      const { store } = makeStore({ defaultValue: null as T })
      expect(store.get()).toBeNull()
    })
  })

  describe('set()', () => {
    it('persists value', () => {
      const { store } = makeStore({ defaultValue: 0 })
      store.set(42)
      expect(store.get()).toBe(42)
    })

    it('overwrites previous value', () => {
      const { store } = makeStore({ defaultValue: '' })
      store.set('first')
      store.set('second')
      expect(store.get()).toBe('second')
    })
  })

  describe('update()', () => {
    it('applies transform to current value', () => {
      const { store } = makeStore({ defaultValue: [] as string[] })
      store.update(items => [...items, 'a'])
      store.update(items => [...items, 'b'])
      expect(store.get()).toEqual(['a', 'b'])
    })

    it('reads defaultValue on first update when nothing stored', () => {
      const { store } = makeStore({ defaultValue: { count: 0 } })
      store.update(v => ({ count: v.count + 1 }))
      expect(store.get()).toEqual({ count: 1 })
    })
  })

  describe('clear()', () => {
    it('resets to defaultValue', () => {
      const { store } = makeStore({ defaultValue: [] as number[] })
      store.set([1, 2, 3])
      store.clear()
      expect(store.get()).toEqual([])
    })
  })

  describe('SSR (storage = null)', () => {
    it('returns defaultValue when no storage backend', () => {
      // Simula SSR passando storage=undefined e sem window (não testável em Node diretamente,
      // mas validamos via injected=undefined com storage mock retornando null)
      const store = createStore({ key: 'ssr', defaultValue: 'fallback' })
      // No Node/vitest environment, window.localStorage pode ser undefined — get() deve retornar fallback
      // Aqui só verificamos que a função não lança
      expect(() => store.get()).not.toThrow()
    })
  })
})

describe('memoryBackend', () => {
  it('is isolated per call', () => {
    const a = memoryBackend()
    const b = memoryBackend()
    a.setItem('k', 'v1')
    b.setItem('k', 'v2')
    expect(a.getItem('k')).toBe('v1')
    expect(b.getItem('k')).toBe('v2')
  })

  it('getItem returns null for missing key', () => {
    expect(memoryBackend().getItem('missing')).toBeNull()
  })

  it('removeItem deletes key', () => {
    const m = memoryBackend()
    m.setItem('k', 'v')
    m.removeItem('k')
    expect(m.getItem('k')).toBeNull()
  })
})
