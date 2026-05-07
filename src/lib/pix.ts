import { crc16 } from './crc16'
import { normalize } from './normalize'

function emvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return id + len + value
}

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA'

export interface PixParams {
  keyType: PixKeyType
  key: string
  name: string
  city: string
  value?: number
  txid?: string
  description?: string
}

// ---------------------------------------------------------------------------
// Metadados por tipo de chave — usados pelo formulário
// ---------------------------------------------------------------------------

export const KEY_TYPES: readonly PixKeyType[] = ['CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA']

export const KEY_META: Record<PixKeyType, { label: string; placeholder: string; maxLength: number }> = {
  CPF:       { label: 'CPF',                   placeholder: '000.000.000-00',                       maxLength: 14 },
  CNPJ:      { label: 'CNPJ',                  placeholder: '00.000.000/0000-00',                   maxLength: 18 },
  EMAIL:     { label: 'E-mail',                placeholder: 'exemplo@email.com',                    maxLength: 77 },
  TELEFONE:  { label: 'Telefone',              placeholder: '+5511999998888',                        maxLength: 15 },
  ALEATORIA: { label: 'Chave aleatória (UUID)', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', maxLength: 36 },
}

// ---------------------------------------------------------------------------
// Validação de formulário
// ---------------------------------------------------------------------------

export interface PixFormFields {
  keyType: PixKeyType
  key: string
  name: string
  city: string
  value?: string       // string vinda do input (parseFloat interno)
  txid?: string
  description?: string
}

export type PixFieldErrors = Partial<Record<'key' | 'name' | 'city', string>>

export function validatePixForm(fields: PixFormFields): PixFieldErrors {
  const errors: PixFieldErrors = {}
  const { keyType, key, name, city } = fields
  const trimmedKey = key.trim()

  if (!trimmedKey) {
    errors.key = 'Informe a chave Pix'
  } else {
    const digits = trimmedKey.replace(/\D/g, '')
    if (keyType === 'CPF' && digits.length !== 11) {
      errors.key = 'CPF deve ter 11 dígitos'
    } else if (keyType === 'CNPJ' && digits.length !== 14) {
      errors.key = 'CNPJ deve ter 14 dígitos'
    } else if (keyType === 'EMAIL' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedKey)) {
      errors.key = 'Informe um e-mail válido'
    } else if (keyType === 'TELEFONE' && !/^\+\d{10,14}$/.test(trimmedKey)) {
      errors.key = 'Telefone deve iniciar com + e código do país (ex: +5511999998888)'
    } else if (keyType === 'ALEATORIA' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedKey)) {
      errors.key = 'Chave aleatória deve estar no formato UUID'
    }
  }

  if (!name.trim()) errors.name = 'Informe o nome do recebedor'
  if (!city.trim()) errors.city = 'Informe a cidade'

  return errors
}

// ---------------------------------------------------------------------------
// Build — valida + gera payload em 1 call, retorna union sem throw
// ---------------------------------------------------------------------------

export type BuildResult =
  | { ok: true; payload: string; valueCapped: boolean }
  | { ok: false; errors: PixFieldErrors }

export function buildPixPayload(fields: PixFormFields): BuildResult {
  const errors = validatePixForm(fields)
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const { keyType, key, name, city, value, txid, description } = fields

  const parsedValue = value ? parseFloat(value) : undefined
  const valueCapped = parsedValue !== undefined && !isNaN(parsedValue) && parsedValue > 999_999.99
  const numValue = parsedValue !== undefined && !isNaN(parsedValue) && parsedValue > 0
    ? Math.min(999_999.99, parsedValue)
    : undefined

  const payload = generatePixPayload({
    keyType,
    key: key.trim(),
    name: name.trim(),
    city: city.trim(),
    value: numValue,
    txid: txid?.trim() || undefined,
    description: description?.trim() || undefined,
  })

  return { ok: true, payload, valueCapped }
}

// ---------------------------------------------------------------------------
// Geração interna — sem validação (use buildPixPayload para formulários)
// ---------------------------------------------------------------------------

function normalizePixKey(keyType: PixKeyType, key: string): string {
  if (keyType === 'CPF' || keyType === 'CNPJ') {
    return key.replace(/\D/g, '')
  }
  return key
}

export function generatePixPayload(params: PixParams): string {
  const { keyType, key, name, city, value, txid, description } = params

  const normalizedKey = normalizePixKey(keyType, key)
  const normalizedName = normalize(name).slice(0, 25)
  const normalizedCity = normalize(city).slice(0, 15)
  const txidValue = (txid && txid.trim()) ? txid.trim().slice(0, 25) : '***'

  // ID 00
  const f00 = emvField('00', '01')

  // ID 26 — Merchant Account Information
  const gui = emvField('00', 'br.gov.bcb.pix')
  const keyField = emvField('01', normalizedKey)
  let descField = ''
  if (description) {
    const maxDescLen = Math.max(0, Math.min(40, 99 - gui.length - keyField.length - 4))
    if (maxDescLen > 0) {
      descField = emvField('02', normalize(description).slice(0, maxDescLen))
    }
  }
  const f26 = emvField('26', gui + keyField + descField)

  // ID 52
  const f52 = emvField('52', '0000')

  // ID 53
  const f53 = emvField('53', '986')

  // ID 54
  const f54 = value && value > 0 ? emvField('54', value.toFixed(2)) : ''

  // ID 58
  const f58 = emvField('58', 'BR')

  // ID 59
  const f59 = emvField('59', normalizedName)

  // ID 60
  const f60 = emvField('60', normalizedCity)

  // ID 62
  const f62 = emvField('62', emvField('05', txidValue))

  const payloadWithoutCrc = f00 + f26 + f52 + f53 + f54 + f58 + f59 + f60 + f62 + '6304'
  const checksum = crc16(payloadWithoutCrc)

  return payloadWithoutCrc + checksum
}
