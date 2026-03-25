interface LastUpdatedProps {
  date: string
}

export default function LastUpdated({ date }: LastUpdatedProps) {
  return (
    <p className="text-xs text-gray-400 mt-2">
      Atualizado em {date}
    </p>
  )
}
