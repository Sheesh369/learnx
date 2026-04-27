import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const SIZE_MAP = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }

export function Spinner({ size = 'md', text, className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Loader2 className={`${SIZE_MAP[size]} text-primary-600 animate-spin`} />
      {text && <span className="text-sm text-neutral-600">{text}</span>}
    </div>
  )
}
