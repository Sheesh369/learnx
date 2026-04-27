import { CONTENT_TYPE_LABELS } from '@/lib/constants'

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-neutral-600 bg-neutral-100',
    pending: 'text-accent-600 bg-accent-50',
    approved: 'text-success-600 bg-success-50',
    rejected: 'text-danger-600 bg-danger-50',
    scheduled: 'text-primary-600 bg-primary-50',
    active: 'text-success-600 bg-success-50',
    completed: 'text-neutral-600 bg-neutral-100',
  }
  return colors[status] || 'text-neutral-600 bg-neutral-100'
}

export function getContentTypeLabel(type: string): string {
  return CONTENT_TYPE_LABELS[type] || type
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
