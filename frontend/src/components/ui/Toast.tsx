import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import useToastStore from '@/store/toastStore'

interface ToastProps {
  show: boolean
  message: string
  description?: string
  onClose: () => void
  duration?: number
  variant?: 'success' | 'error' | 'info'
  standalone?: boolean
}

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-danger-600 shrink-0" />,
  info: <Info className="w-5 h-5 text-info-600 shrink-0" />,
}

export function Toast({
  show,
  message,
  description,
  onClose,
  duration = 4000,
  variant = 'success',
  standalone = true,
}: ToastProps) {
  useEffect(() => {
    if (!show || duration === 0) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [show, duration, onClose])

  if (!show) return null

  return (
    <div className={standalone ? 'fixed top-4 right-4 z-50 animate-fade-in' : 'animate-fade-in'}>
      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl shadow-lg max-w-sm">
        {ICONS[variant]}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900">{message}</p>
          {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg shrink-0">
          <X className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          show
          message={t.message}
          description={t.description}
          variant={t.variant}
          duration={t.duration}
          onClose={() => removeToast(t.id)}
          standalone={false}
        />
      ))}
    </div>
  )
}
