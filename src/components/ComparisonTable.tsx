interface ComparisonRow {
  criterio: string
  valorA: string
  valorB: string
}

interface ComparisonTableProps {
  termoA: string
  termoB: string
  rows: ComparisonRow[]
}

/**
 * Tabela comparativa responsiva (stacking cards no mobile, tabela no desktop).
 * Renderizada server-side sem JS. Apenas dados simples; o texto em `valorA`/`valorB`
 * é tratado como string pura para simplicidade — se precisar de marks inline,
 * passar pelo MarkdownContent no caller.
 */
export default function ComparisonTable({ termoA, termoB, rows }: ComparisonTableProps) {
  if (rows.length === 0) return null

  return (
    <section className="my-10" aria-labelledby="tabela-comparativa">
      <h2 id="tabela-comparativa" className="text-2xl font-bold text-gray-900 mb-4">
        {termoA} vs {termoB} — comparação
      </h2>

      {/* Desktop: tabela */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-gray-200">
          <caption className="sr-only">Comparação entre {termoA} e {termoB}</caption>
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="text-left p-4 font-semibold text-gray-700 text-sm">Critério</th>
              <th scope="col" className="text-left p-4 font-semibold text-indigo-700 text-sm">{termoA}</th>
              <th scope="col" className="text-left p-4 font-semibold text-emerald-700 text-sm">{termoB}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <th scope="row" className="text-left p-4 font-medium text-gray-900 text-sm align-top">
                  {row.criterio}
                </th>
                <td className="p-4 text-sm text-gray-700 align-top">{row.valorA}</td>
                <td className="p-4 text-sm text-gray-700 align-top">{row.valorB}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="font-semibold text-gray-900 mb-2 text-sm">{row.criterio}</p>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs font-semibold text-indigo-700 block">{termoA}</span>
                <span className="text-gray-700">{row.valorA}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 block">{termoB}</span>
                <span className="text-gray-700">{row.valorB}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
