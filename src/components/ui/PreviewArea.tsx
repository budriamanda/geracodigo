interface PreviewAreaProps {
  title: string
  hasContent: boolean
  emptyText?: string
  ariaLiveText?: string
  className?: string
  children: React.ReactNode
}

export default function PreviewArea({
  title,
  hasContent,
  emptyText = 'O resultado aparecerá aqui',
  ariaLiveText,
  className = '',
  children,
}: PreviewAreaProps) {
  return (
    <div className={`flex-1 bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900 self-start">{title}</h2>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaLiveText ?? ''}
      </div>
      {hasContent ? (
        children
      ) : (
        <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm text-center px-4">
          {emptyText}
        </div>
      )}
    </div>
  )
}
