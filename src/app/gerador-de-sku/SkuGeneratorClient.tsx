'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { generateSku, generateSkuBatch, type SkuConfig } from '@/lib/sku-generator'
import { trackGenerate, trackBatchGenerate, trackCopy, trackDownload } from '@/lib/analytics'
import { downloadBlob } from '@/lib/download'
import { showToast } from '@/components/Toast'
import PrivacyChip from '@/components/ui/PrivacyChip'
import { incrementCount } from '@/lib/counter'

const SEPARATORS = [
  { value: '-', label: 'Hífen (-)' },
  { value: '_', label: 'Underline (_)' },
  { value: '.', label: 'Ponto (.)' },
  { value: '', label: 'Sem separador' },
]

const inputNormal = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors'

function genAttrId() { return `attr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }

export default function SkuGeneratorClient() {
  const [prefix, setPrefix] = useState('')
  const [category, setCategory] = useState('')
  const [attributes, setAttributes] = useState(() => [
    { id: genAttrId(), value: '' },
    { id: genAttrId(), value: '' },
  ])
  const [sequential, setSequential] = useState(1)
  const [separator, setSeparator] = useState('-')
  const [batchCount, setBatchCount] = useState(1)
  const [results, setResults] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const [validationError, setValidationError] = useState('')
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
  }, [])

  const filteredAttributes = useMemo(
    () => attributes.map(a => a.value).filter(v => v.trim()),
    [attributes],
  )

  const config: SkuConfig = useMemo(
    () => ({ prefix, category, attributes: filteredAttributes, sequential, separator }),
    [prefix, category, filteredAttributes, sequential, separator],
  )

  const preview = useMemo(() => generateSku(config), [config])

  const hasTextParts = !!(prefix.trim() || category.trim() || filteredAttributes.length > 0)

  const handleGenerate = useCallback(() => {
    if (!hasTextParts && sequential <= 0) {
      setValidationError('Preencha pelo menos um campo (prefixo, categoria ou atributo) para gerar o SKU.')
      return
    }
    setValidationError('')
    const skus = batchCount > 1
      ? generateSkuBatch(config, batchCount)
      : [generateSku(config)]
    setResults(skus)
    if (batchCount > 1) {
      trackBatchGenerate('sku_generator', 'sku', skus.length)
    } else {
      trackGenerate('sku_generator', 'sku')
    }
    incrementCount(skus.length)
  }, [config, batchCount, hasTextParts, sequential])

  const addAttribute = () => setAttributes(prev => [...prev, { id: genAttrId(), value: '' }])

  const updateAttribute = (index: number, value: string) => {
    setAttributes(prev => prev.map((a, i) => i === index ? { ...a, value } : a))
  }

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  const handleCopyAll = async () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    try {
      await navigator.clipboard.writeText(results.join('\n'))
      setCopied(true)
      setCopyError(false)
      trackCopy('sku_generator', 'sku_list')
      showToast('Copiado para a \u00E1rea de transfer\u00EAncia', 'success')
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
      copyTimeoutRef.current = setTimeout(() => setCopyError(false), 3000)
    }
  }

  const handleDownloadCsv = () => {
    const csv = '\uFEFF' + 'SKU\n' + results.join('\n')
    downloadBlob(new Blob([csv], { type: 'text/csv' }), 'skus.csv')
    trackDownload('sku_generator', 'sku', 'csv')
    showToast('Download iniciado \u2014 CSV', 'success')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label htmlFor="sku-prefix" className="block text-sm font-medium text-gray-700 mb-1">
            Prefixo da marca/loja <span className="text-gray-400 font-normal">(opcional, max 4 chars)</span>
          </label>
          <input
            id="sku-prefix"
            type="text"
            value={prefix}
            onChange={e => setPrefix(e.target.value)}
            placeholder="Ex: LOJA, MKT, BR"
            maxLength={4}
            className={inputNormal}
          />
        </div>

        <div>
          <label htmlFor="sku-category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria <span className="text-gray-400 font-normal">(max 4 chars)</span>
          </label>
          <input
            id="sku-category"
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Ex: CAM (camiseta), SAP (sapato)"
            maxLength={4}
            className={inputNormal}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atributos <span className="text-gray-400 font-normal">(cor, tamanho, etc.)</span>
          </label>
          <div className="space-y-2">
            {attributes.map((attr, i) => (
              <div key={attr.id} className="flex gap-2">
                <input
                  type="text"
                  value={attr.value}
                  onChange={e => updateAttribute(i, e.target.value)}
                  placeholder={i === 0 ? 'Ex: AZL (azul)' : i === 1 ? 'Ex: M (médio)' : `Atributo ${i + 1}`}
                  maxLength={4}
                  className={inputNormal}
                  aria-label={`Atributo ${i + 1}`}
                />
                {attributes.length > 1 && (
                  <button onClick={() => removeAttribute(i)} className="text-gray-400 hover:text-red-500 px-2" aria-label="Remover atributo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAttribute}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Adicionar atributo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sku-sequential" className="block text-sm font-medium text-gray-700 mb-1">Número sequencial</label>
            <input
              id="sku-sequential"
              type="number"
              min={0}
              value={sequential}
              onChange={e => setSequential(Math.max(0, parseInt(e.target.value) || 0))}
              className={inputNormal}
            />
          </div>
          <div>
            <label htmlFor="sku-separator" className="block text-sm font-medium text-gray-700 mb-1">Separador</label>
            <select id="sku-separator" value={separator} onChange={e => setSeparator(e.target.value)} className={inputNormal}>
              {SEPARATORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="sku-batch" className="block text-sm font-medium text-gray-700 mb-1">Quantidade a gerar</label>
          <input
            id="sku-batch"
            type="number"
            min={1}
            max={500}
            value={batchCount}
            onChange={e => setBatchCount(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
            className={inputNormal}
          />
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Preview do SKU:</p>
          <p className="text-lg font-mono font-bold text-indigo-700">{preview || '—'}</p>
        </div>

        {validationError && (
          <p className="text-red-600 text-xs flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span> {validationError}
          </p>
        )}

        <button
          onClick={handleGenerate}
          className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Gerar {batchCount > 1 ? `${batchCount} SKUs` : 'SKU'}
        </button>
        <PrivacyChip />
      </div>

      {/* Results */}
      <div className="flex-1">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {results.length > 0 ? `${results.length} SKU${results.length > 1 ? 's' : ''} gerado${results.length > 1 ? 's' : ''} com sucesso` : ''}
        </div>
        {results.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">SKUs gerados ({results.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAll}
                  className={`text-xs px-3 py-2 rounded-full font-medium transition-colors min-h-[44px] ${
                    copyError
                      ? 'bg-red-100 text-red-700'
                      : copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copyError ? 'Falha ao copiar' : copied ? 'Copiado!' : 'Copiar todos'}
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="text-xs px-3 py-2 rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors min-h-[44px]"
                >
                  CSV
                </button>
              </div>
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto font-mono text-sm">
              {results.map((sku, idx) => (
                <div key={`${sku}-${idx}`} className="bg-gray-50 rounded px-3 py-1.5 text-gray-800">
                  {sku}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center min-h-[300px]">
            <p className="text-gray-400 text-sm text-center">
              Configure os campos e clique em &quot;Gerar&quot; para criar seus SKUs
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
