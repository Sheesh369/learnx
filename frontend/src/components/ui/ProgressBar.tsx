interface ProgressBarProps {
  value: number
  label?: string
  gradient?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({ value, label, gradient, size = 'md', className = '' }: ProgressBarProps) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5'
  const bg = gradient ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-primary-500'

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
          <span>{label}</span>
          <span className="font-semibold">{Math.round(value)}%</span>
        </div>
      )}
      <div className={`w-full bg-neutral-100 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} ${bg} rounded-full transition-all duration-100`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}
