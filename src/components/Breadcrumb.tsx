import Link from 'next/link'

interface BreadcrumbProps {
  current: string
}

export default function Breadcrumb({ current }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            GeraCode
          </Link>
        </li>
        <li aria-hidden="true" className="text-gray-300 mx-1">/</li>
        <li>
          <span aria-current="page" className="text-gray-700 font-medium">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  )
}
