import Link from 'next/link'

export interface BreadcrumbTrail {
  /** Exibido no breadcrumb. */
  label: string
  /** Caminho absoluto (ex: "/blog"). */
  href: string
}

interface BreadcrumbProps {
  /** Nome da página atual (último item, sem href). */
  current: string
  /** Trilhas intermediárias entre "GeraCode" (home) e `current`. Opcional. */
  trail?: BreadcrumbTrail[]
}

export default function Breadcrumb({ current, trail }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            GeraCode
          </Link>
        </li>
        {trail?.map((item) => (
          <li key={item.href} className="flex items-center gap-1">
            <span aria-hidden="true" className="text-gray-300 mx-1">/</span>
            <Link href={item.href} className="hover:text-indigo-600 transition-colors">
              {item.label}
            </Link>
          </li>
        ))}
        <li className="flex items-center gap-1">
          <span aria-hidden="true" className="text-gray-300 mx-1">/</span>
          <span aria-current="page" className="text-gray-700 font-medium">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}
