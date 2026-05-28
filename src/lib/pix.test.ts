import { describe, it, expect } from 'vitest'
import { generatePixPayload, validatePixForm, buildPixPayload, KEY_META, KEY_TYPES, type PixParams, type PixFormFields } from './pix'
import { crc16 } from './crc16'
import { normalize } from './normalize'

const baseFields: PixFormFields = {
  keyType: 'EMAIL',
  key: 'fulano@email.com',
  name: 'Fulano de Tal',
  city: 'Sao Paulo',
}

describe('KEY_META / KEY_TYPES', () => {
  it('KEY_TYPES has 5 entries', () => {
    expect(KEY_TYPES).toHaveLength(5)
  })

  it('every KEY_TYPE has label, placeholder and maxLength in KEY_META', () => {
    for (const kt of KEY_TYPES) {
      expect(KEY_META[kt].label).toBeTruthy()
      expect(KEY_META[kt].placeholder).toBeTruthy()
      expect(KEY_META[kt].maxLength).toBeGreaterThan(0)
    }
  })
})

describe('validatePixForm', () => {
  it('returns empty errors for valid EMAIL', () => {
    expect(validatePixForm(baseFields)).toEqual({})
  })

  it('errors on empty key', () => {
    const r = validatePixForm({ ...baseFields, key: '' })
    expect(r.key).toBeTruthy()
  })

  it('errors on CPF with wrong digit count', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'CPF', key: '123' })
    expect(r.key).toMatch(/11 dígitos/)
  })

  it('accepts CPF with 11 digits stripped of formatting', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'CPF', key: '529.982.247-25' })
    expect(r.key).toBeUndefined()
  })

  it('errors on CPF with invalid check digits', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'CPF', key: '123.456.789-00' })
    expect(r.key).toMatch(/inválido/)
  })

  it('errors on CNPJ with wrong digit count', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'CNPJ', key: '12345' })
    expect(r.key).toMatch(/14 dígitos/)
  })

  it('accepts CNPJ with 14 digits', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'CNPJ', key: '11.222.333/0001-81' })
    expect(r.key).toBeUndefined()
  })

  it('errors on CNPJ with invalid check digits', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'CNPJ', key: '12.345.678/0001-90' })
    expect(r.key).toMatch(/inválido/)
  })

  it('errors on invalid EMAIL', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'EMAIL', key: 'not-an-email' })
    expect(r.key).toBeTruthy()
  })

  it('errors on TELEFONE without +', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'TELEFONE', key: '11999998888' })
    expect(r.key).toMatch(/\+/)
  })

  it('accepts valid TELEFONE', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'TELEFONE', key: '+5511999998888' })
    expect(r.key).toBeUndefined()
  })

  it('errors on invalid ALEATORIA UUID', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'ALEATORIA', key: 'not-a-uuid' })
    expect(r.key).toMatch(/UUID/)
  })

  it('accepts valid UUID for ALEATORIA', () => {
    const r = validatePixForm({ ...baseFields, keyType: 'ALEATORIA', key: '123e4567-e89b-12d3-a456-426614174000' })
    expect(r.key).toBeUndefined()
  })

  it('errors on empty name', () => {
    const r = validatePixForm({ ...baseFields, name: '' })
    expect(r.name).toBeTruthy()
  })

  it('errors on empty city', () => {
    const r = validatePixForm({ ...baseFields, city: '' })
    expect(r.city).toBeTruthy()
  })
})

describe('buildPixPayload', () => {
  it('returns ok:true for valid fields', () => {
    const r = buildPixPayload(baseFields)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.payload).toBeTruthy()
  })

  it('returns ok:false for invalid fields', () => {
    const r = buildPixPayload({ ...baseFields, key: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.errors.key).toBeTruthy()
  })

  it('valueCapped = false when value <= 999999.99', () => {
    const r = buildPixPayload({ ...baseFields, value: '100' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.valueCapped).toBe(false)
  })

  it('valueCapped = true and payload clamps to 999999.99 when value > max', () => {
    const r = buildPixPayload({ ...baseFields, value: '2000000' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.valueCapped).toBe(true)
      expect(r.payload).toContain('999999.99')
    }
  })

  it('no value field in payload when value is empty', () => {
    const r = buildPixPayload(baseFields)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.payload).not.toMatch(/54\d{2}\d+\.\d{2}/)
  })
})

describe('crc16', () => {
  it('returns a 4-char uppercase hex string', () => {
    const result = crc16('test')
    expect(result).toMatch(/^[0-9A-F]{4}$/)
  })

  it('is deterministic', () => {
    expect(crc16('abc')).toBe(crc16('abc'))
  })

  it('returns different values for different inputs', () => {
    expect(crc16('abc')).not.toBe(crc16('xyz'))
  })

  it('handles empty string', () => {
    const result = crc16('')
    expect(result).toMatch(/^[0-9A-F]{4}$/)
  })
})

describe('normalize', () => {
  it('removes accents', () => {
    expect(normalize('São Paulo')).toBe('SAO PAULO')
  })

  it('converts to uppercase', () => {
    expect(normalize('hello')).toBe('HELLO')
  })

  it('replaces special characters with spaces', () => {
    expect(normalize('a@b#c')).toBe('A B C')
  })

  it('collapses multiple spaces', () => {
    expect(normalize('a   b   c')).toBe('A B C')
  })

  it('trims whitespace', () => {
    expect(normalize('  test  ')).toBe('TEST')
  })

  it('handles complex Brazilian names', () => {
    expect(normalize('José da Conceição')).toBe('JOSE DA CONCEICAO')
  })

  it('preserves numbers', () => {
    expect(normalize('pedido 123')).toBe('PEDIDO 123')
  })
})

describe('generatePixPayload', () => {
  const baseParams = {
    keyType: 'EMAIL' as const,
    key: 'fulano@email.com',
    name: 'Fulano de Tal',
    city: 'Sao Paulo',
  }

  it('starts with payload format indicator 000201', () => {
    const payload = generatePixPayload(baseParams)
    expect(payload.startsWith('000201')).toBe(true)
  })

  it('ends with CRC field (6304 + 4 hex chars)', () => {
    const payload = generatePixPayload(baseParams)
    const crcPart = payload.slice(-8)
    expect(crcPart.startsWith('6304')).toBe(true)
    expect(crcPart.slice(4)).toMatch(/^[0-9A-F]{4}$/)
  })

  it('contains br.gov.bcb.pix GUI', () => {
    const payload = generatePixPayload(baseParams)
    expect(payload).toContain('br.gov.bcb.pix')
  })

  it('contains the Pix key', () => {
    const payload = generatePixPayload(baseParams)
    expect(payload).toContain('fulano@email.com')
  })

  it('contains country code BR', () => {
    const payload = generatePixPayload(baseParams)
    expect(payload).toContain('5802BR')
  })

  it('contains currency code 986 (BRL)', () => {
    const payload = generatePixPayload(baseParams)
    expect(payload).toContain('5303986')
  })

  it('includes value field when provided', () => {
    const payload = generatePixPayload({ ...baseParams, value: 10.5 })
    expect(payload).toContain('5405')
    expect(payload).toContain('10.50')
  })

  it('omits value field when not provided', () => {
    const payload = generatePixPayload(baseParams)
    expect(payload).not.toMatch(/54\d{2}\d+\.\d{2}/)
    expect(payload).toMatch(/5303986.*5802BR/)
  })

  it('uses *** as default txid', () => {
    const payload = generatePixPayload(baseParams)
    expect(payload).toContain('***')
  })

  it('uses custom txid when provided', () => {
    const payload = generatePixPayload({ ...baseParams, txid: 'PEDIDO001' })
    expect(payload).toContain('PEDIDO001')
  })

  it('includes description when provided', () => {
    const payload = generatePixPayload({ ...baseParams, description: 'Pagamento teste' })
    expect(payload).toContain('PAGAMENTO TESTE')
  })

  it('normalizes name (uppercase, no accents)', () => {
    const payload = generatePixPayload({ ...baseParams, name: 'José' })
    expect(payload).toContain('JOSE')
  })

  it('truncates name to 25 chars', () => {
    const longName = 'A'.repeat(30)
    const payload = generatePixPayload({ ...baseParams, name: longName })
    expect(payload).toContain('A'.repeat(25))
    expect(payload).not.toContain('A'.repeat(26))
  })

  it('truncates city to 15 chars', () => {
    const longCity = 'B'.repeat(20)
    const payload = generatePixPayload({ ...baseParams, city: longCity })
    expect(payload).toContain('B'.repeat(15))
    expect(payload).not.toContain('B'.repeat(16))
  })

  it('has valid CRC16 checksum', () => {
    const payload = generatePixPayload(baseParams)
    const payloadWithoutCrc = payload.slice(0, -4)
    const expectedCrc = crc16(payloadWithoutCrc)
    const actualCrc = payload.slice(-4)
    expect(actualCrc).toBe(expectedCrc)
  })

  it('supports all key types', () => {
    const cases: { keyType: PixParams['keyType']; key: string; expected: string }[] = [
      { keyType: 'CPF', key: '12345678900', expected: '12345678900' },
      { keyType: 'CNPJ', key: '12345678000190', expected: '12345678000190' },
      { keyType: 'EMAIL', key: 'test@email.com', expected: 'test@email.com' },
      { keyType: 'TELEFONE', key: '+5511999998888', expected: '+5511999998888' },
      { keyType: 'ALEATORIA', key: 'abc-123-uuid', expected: 'abc-123-uuid' },
    ]
    for (const { keyType, key, expected } of cases) {
      const payload = generatePixPayload({ ...baseParams, keyType, key })
      expect(payload).toContain(expected)
    }
  })

  it('strips formatting from CPF key', () => {
    const payload = generatePixPayload({ ...baseParams, keyType: 'CPF', key: '123.456.789-00' })
    expect(payload).toContain('12345678900')
    expect(payload).not.toContain('123.456.789-00')
  })

  it('strips formatting from CNPJ key', () => {
    const payload = generatePixPayload({ ...baseParams, keyType: 'CNPJ', key: '12.345.678/0001-90' })
    expect(payload).toContain('12345678000190')
    expect(payload).not.toContain('12.345.678/0001-90')
  })

  it('preserves EMAIL key as-is', () => {
    const payload = generatePixPayload({ ...baseParams, keyType: 'EMAIL', key: 'test@example.com' })
    expect(payload).toContain('test@example.com')
  })

  it('preserves TELEFONE key as-is', () => {
    const payload = generatePixPayload({ ...baseParams, keyType: 'TELEFONE', key: '+5511999998888' })
    expect(payload).toContain('+5511999998888')
  })
})
