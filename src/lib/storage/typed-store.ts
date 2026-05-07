/**
 * TypedStore — abstração fina sobre localStorage (ou qualquer StorageBackend).
 *
 * Benefícios:
 * - Guard SSR em um único lugar (`getStorage()`)
 * - Try/catch em um único lugar
 * - `update()` para read-modify-write atômico
 * - `storage?` injetável para testes sem mock de window.localStorage
 */

export interface StorageBackend {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface TypedStore<T> {
  get(): T
  set(value: T): void
  update(fn: (current: T) => T): void
  clear(): void
}

/** Backend em memória — zero globals, ideal para testes. */
export function memoryBackend(): StorageBackend {
  const store = new Map<string, string>()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  }
}

export function createStore<T>(options: {
  key: string
  defaultValue: T
  validate?: (parsed: unknown) => parsed is T
  /** Omitir para usar window.localStorage em runtime. */
  storage?: StorageBackend
}): TypedStore<T> {
  const { key, defaultValue, validate, storage: injected } = options

  function getStorage(): StorageBackend | null {
    if (injected) return injected
    if (typeof window === 'undefined') return null
    try {
      return window.localStorage
    } catch {
      return null
    }
  }

  function read(): T {
    const backend = getStorage()
    if (!backend) return defaultValue
    try {
      const raw = backend.getItem(key)
      if (raw === null) return defaultValue
      const parsed: unknown = JSON.parse(raw)
      if (validate && !validate(parsed)) return defaultValue
      return parsed as T
    } catch {
      return defaultValue
    }
  }

  function write(value: T): void {
    const backend = getStorage()
    if (!backend) return
    try {
      backend.setItem(key, JSON.stringify(value))
    } catch {
      // QuotaExceededError ou localStorage bloqueado — silencia (sem crash)
    }
  }

  return {
    get: read,
    set: write,
    update(fn) {
      write(fn(read()))
    },
    clear() {
      const backend = getStorage()
      if (!backend) return
      try {
        backend.removeItem(key)
      } catch { /* noop */ }
    },
  }
}
