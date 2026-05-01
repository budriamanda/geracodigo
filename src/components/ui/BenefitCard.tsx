import { Lock, Zap, MapPin, Package, type LucideIcon } from 'lucide-react'

const ICONS: LucideIcon[] = [Lock, Zap, MapPin, Package]

interface BenefitCardProps {
  index: number
  titulo: string
  descricao: string
}

export default function BenefitCard({ index, titulo, descricao }: BenefitCardProps) {
  const Icon = ICONS[index % ICONS.length]
  return (
    <div className="flex flex-col gap-3">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-gray-900">{titulo}</h3>
      <p className="text-sm text-gray-500">{descricao}</p>
    </div>
  )
}
