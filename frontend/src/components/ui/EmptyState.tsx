import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      {icon && <div className="mb-4 text-neutral-300">{icon}</div>}
      <p className="text-base font-semibold text-neutral-500 mb-1">{title}</p>
      {description && <p className="text-sm text-neutral-400 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
