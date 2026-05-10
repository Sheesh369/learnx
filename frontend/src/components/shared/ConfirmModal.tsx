import { Loader2 } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-neutral-900">{title}</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-danger-600 hover:bg-danger-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
