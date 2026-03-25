import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Ferramentas</h2>
            <ul className="space-y-2">
              <li><Link href="/gerador-de-codigo-de-barras" className="hover:text-indigo-600">Código de Barras</Link></li>
              <li><Link href="/gerador-de-ean" className="hover:text-indigo-600">EAN-13 / EAN-8</Link></li>
              <li><Link href="/gerador-de-qr-code-pix" className="hover:text-indigo-600">QR Code Pix</Link></li>
              <li><Link href="/gerador-de-qr-code" className="hover:text-indigo-600">QR Code</Link></li>
              <li><Link href="/leitor-de-codigo-de-barras" className="hover:text-indigo-600">Leitor de Código de Barras</Link></li>
              <li><Link href="/gerador-de-sku" className="hover:text-indigo-600">Gerador de SKU</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">GeraCode</h2>
            <ul className="space-y-2">
              <li><Link href="/sobre" className="hover:text-indigo-600">Sobre</Link></li>
              <li><Link href="/privacidade" className="hover:text-indigo-600">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-indigo-600">Termos de Uso</Link></li>
            </ul>
            <p className="text-gray-500 text-xs leading-relaxed mt-3">
              Ferramentas gratuitas de geração de código de barras e QR Code Pix para lojistas brasileiros. 100% privado, sem cadastro.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> GeraCode · Ferramentas gratuitas para lojistas brasileiros
        </div>
      </div>
    </footer>
  )
}
