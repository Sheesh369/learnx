import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  children?: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

const VARIANT_CLASSES = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  outline: 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
  ghost: 'text-neutral-600 hover:bg-neutral-100',
  danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-sm',
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-sm gap-2 rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', icon, disabled, loading, fullWidth, children, onClick, className = '', type = 'button' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}
