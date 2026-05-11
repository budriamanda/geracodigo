import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { buildPixPayload, type PixKeyType } from '@/lib/pix'
import CopyPayloadButton from './CopyPayloadButton'

export const metadata: Metadata = {
  title: 'Pagamento via Pix',
  description: 'Escaneie o QR Code para pagar via Pix.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PagarPage({ searchParams }: PageProps) {
  const params = await searchParams

  const t = typeof params.t === 'string' ? params.t : ''
  const k = typeof params.k === 'string' ? params.k : ''
  const n = typeof params.n === 'string' ? params.n : ''
  const c = typeof params.c === 'string' ? params.c : ''
  const v = typeof params.v === 'string' ? params.v : ''

  const validKeyTypes: PixKeyType[] = ['CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA']
  const keyType = validKeyTypes.includes(t as PixKeyType) ? (t as PixKeyType) : null

  let qrDataUrl: string | null = null
  let payload: string | null = null
  let isValid = false

  if (keyType && k && n && c) {
    const result = buildPixPayload({
      keyType,
      key: k,
      name: n,
      city: c,
      value: v || undefined,
    })

    if (result.ok) {
      payload = result.payload
      try {
        qrDataUrl = await QRCode.toDataURL(result.payload, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        })
        isValid = true
      } catch {
        isValid = false
      }
    }
  }

  const valorNumerico = v && parseFloat(v) > 0 ? parseFloat(v) : null
  const valorFormatado = valorNumerico
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.min(valorNumerico, 999999.99))
    : null

  if (!isValid || !qrDataUrl || !payload) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-md w-full text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900">Link inválido ou expirado</h1>
          <p className="text-gray-600 text-sm">
            Este link de pagamento Pix não é válido ou está incompleto. Peça ao vendedor um novo link.
          </p>
          <a
            href="/gerador-de-qr-code-pix"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors mt-2"
          >
            Crie seu link Pix grátis
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Card principal */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center gap-6">
          {/* Cabeçalho */}
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Pagamento via</p>
            <h1 className="text-4xl font-black text-green-600">PIX</h1>
          </div>

          {/* Nome do recebedor */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Recebedor</p>
            <p className="text-xl font-bold text-gray-900">{n}</p>
          </div>

          {/* Valor */}
          {valorFormatado && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 text-center">
              <p className="text-xs text-green-700 mb-0.5">Valor a pagar</p>
              <p className="text-3xl font-black text-green-700">{valorFormatado}</p>
            </div>
          )}

          {/* QR Code */}
          <div className="border border-gray-100 rounded-xl p-3 bg-white shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL gerada dinamicamente no servidor */}
            <img
              src={qrDataUrl}
              alt={`QR Code Pix para pagar ${n}${valorFormatado ? ` — ${valorFormatado}` : ''}`}
              width={260}
              height={260}
              className="rounded-lg"
            />
          </div>

          {/* Instrução */}
          <p className="text-sm text-gray-600 text-center">
            Abra o app do seu banco, escaneie o QR Code ou copie o código abaixo
          </p>

          {/* Payload copiável */}
          <CopyPayloadButton payload={payload} />
        </div>

        {/* Rodapé */}
        <div className="text-center space-y-3">
          <p className="text-xs text-gray-400">
            Pagamento processado pelo Pix (Banco Central do Brasil).
            <br />
            Link gerado por <span className="font-medium">geracodigo.com.br</span>
          </p>
          <a
            href="/gerador-de-qr-code-pix"
            className="inline-block text-indigo-600 text-sm font-medium hover:underline"
          >
            Crie seu link Pix grátis →
          </a>
        </div>
      </div>
    </main>
  )
}
