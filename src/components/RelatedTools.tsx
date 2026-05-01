import Link from 'next/link'

export interface ToolEntry {
  href: string
  label: string
  desc: string
}

const DEFAULT_TOOLS: ToolEntry[] = [
  { href: '/gerador-de-qr-code-pix', label: 'QR Code Pix', desc: 'QR Code para pagamento via Pix' },
  { href: '/gerador-de-codigo-de-barras', label: 'Código de Barras', desc: 'EAN-13, Code 128, ITF-14 e 12+ formatos' },
  { href: '/gerador-de-ean', label: 'EAN-13 / EAN-8', desc: 'Códigos EAN para produtos e varejo' },
  { href: '/gerador-de-qr-code', label: 'QR Code', desc: 'QR Code para links, textos e conteúdos' },
  { href: '/leitor-de-codigo-de-barras', label: 'Leitor de Código de Barras', desc: 'Leia códigos pela câmera, sem app' },
  { href: '/gerador-de-sku', label: 'Gerador de SKU', desc: 'Crie SKUs padronizados para estoque' },
]

interface RelatedToolsProps {
  currentPath: string
  tools?: ToolEntry[]
}

export default function RelatedTools({ currentPath, tools }: RelatedToolsProps) {
  const related = (tools ?? DEFAULT_TOOLS).filter(t => t.href !== currentPath)
  const cols = related.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : related.length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'

  return (
    <section className="mt-16" aria-labelledby="related-tools">
      <h2 id="related-tools" className="text-2xl font-bold text-gray-900 mb-6">
        Outras ferramentas
      </h2>
      <div className={`grid ${cols} gap-4`}>
        {related.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
