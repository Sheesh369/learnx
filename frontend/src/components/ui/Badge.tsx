import type { ReactNode } from 'react'

interface BadgeProps {
  color?: 'green' | 'amber' | 'red' | 'blue' | 'neutral' | 'purple'
  size?: 'sm' | 'md'
  children: ReactNode
  className?: string
}

const COLOR_MAP = {
  green: 'bg-success-50 text-success-700 border-success-200',
  amber: 'bg-accent-50 text-accent-700 border-accent-200',
  red: 'bg-danger-50 text-danger-700 border-danger-200',
  blue: 'bg-info-50 text-info-700 border-info-200',
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

const SIZE_MAP = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-[11px] px-2.5 py-0.5',
}

export function Badge({ color = 'neutral', size = 'sm', children, className = '' }: BadgeProps) {
  return (
    <span className={`font-semibold rounded-md border ${COLOR_MAP[color]} ${SIZE_MAP[size]} ${className}`}>
      {children}
    </span>
  )
}
