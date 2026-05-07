const SITE_COUNTER = 50_000

export default function SiteCounter() {
  const formatted = new Intl.NumberFormat('pt-BR').format(SITE_COUNTER)
  return (
    <p className="text-sm text-gray-500 mt-2">
      Mais de <strong className="text-gray-700">{formatted}</strong> códigos gerados por lojistas brasileiros
    </p>
  )
}
