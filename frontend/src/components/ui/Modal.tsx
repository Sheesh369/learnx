import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const WIDTH_MAP = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Modal({ open, onClose, title, maxWidth = 'sm', children }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${WIDTH_MAP[maxWidth]} mx-4 p-6`} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
