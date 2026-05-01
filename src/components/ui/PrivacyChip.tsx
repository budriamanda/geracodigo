import { Lock } from 'lucide-react'

export default function PrivacyChip() {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
      Tudo processado no seu navegador — nenhum dado é enviado
    </p>
  )
}
