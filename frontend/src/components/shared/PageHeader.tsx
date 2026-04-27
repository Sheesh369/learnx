import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">{title}</h1>
        {description && <p className="text-text-secondary mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">{title}</h2>
        <p className="text-neutral-500">This page is under development.</p>
      </div>
    </div>
  )
}
