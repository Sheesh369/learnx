import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, X, RotateCcw } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import useProcessingStore, { type ProcessingStatus } from '@/store/processingStore'
import useToastStore from '@/store/toastStore'
import { api } from '@/services/api'

interface StatusConfig {
  label: string
  classes: string
  icon: React.ReactNode
}

const STATUS_CONFIG: Record<ProcessingStatus, StatusConfig> = {
  content_generating: {
    label: 'Generating content...',
    classes: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />,
  },
  questions_generating: {
    label: 'Content ready · Generating questions...',
    classes: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />,
  },
  done: {
    label: 'Ready!',
    classes: 'bg-success-50 border-success-200 text-success-800',
    icon: null,
  },
  error: {
    label: 'Questions failed',
    classes: 'bg-danger-50 border-danger-200 text-danger-700',
    icon: <AlertCircle className="w-3.5 h-3.5 text-danger-600 shrink-0" />,
  },
}

export default function ProcessingStatusBar() {
  const user = useAuthStore((s) => s.user)
  const chapters = useProcessingStore((s) => s.chapters)
  const removeChapter = useProcessingStore((s) => s.removeChapter)
  const navigate = useNavigate()

  if (user?.role !== 'school_admin') return null

  const active = Object.values(chapters).filter((c) => c.status !== 'done')
  if (active.length === 0) return null

  const primary = [...active].sort((a, b) => b.startedAt - a.startedAt)[0]
  const extraCount = active.length - 1
  const config = STATUS_CONFIG[primary.status]

  const handleCancel = async () => {
    try {
      await api.books.cancelProcess(primary.chapterId)
    } catch {
      // already finished or not processing — dismiss silently
    }
    removeChapter(primary.chapterId)
  }

  const handleRegenerate = async () => {
    try {
      await api.questions.generate(primary.chapterId)
      useProcessingStore.getState().updateStatus(primary.chapterId, 'questions_generating')
      useToastStore.getState().addToast('Regenerating questions...', { variant: 'info' })
    } catch (e: unknown) {
      useToastStore.getState().addToast(
        e instanceof Error ? e.message : 'Failed to start regeneration',
        { variant: 'error' }
      )
    }
  }

  return (
    <div className={`border-b px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 text-sm ${config.classes}`}>
      {config.icon}

      <button
        onClick={() => navigate('/admin/ai-processor')}
        className="flex-1 text-left font-medium truncate hover:underline"
      >
        <span className="font-semibold">{primary.chapterTitle}</span>
        <span className="ml-2 font-normal opacity-80">{config.label}</span>
        {extraCount > 0 && (
          <span className="ml-2 text-xs opacity-60">+{extraCount} more</span>
        )}
      </button>

      {primary.status === 'content_generating' && (
        <button
          onClick={handleCancel}
          className="text-xs font-semibold underline shrink-0 hover:opacity-70"
        >
          Cancel
        </button>
      )}

      {primary.status === 'error' && (
        <>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1 text-xs font-semibold underline shrink-0 hover:opacity-70"
          >
            <RotateCcw className="w-3 h-3" />
            Retry Questions
          </button>
          <button
            onClick={() => removeChapter(primary.chapterId)}
            className="p-0.5 rounded hover:bg-black/10 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  )
}
