import { useEffect, useRef } from 'react'
import useAuthStore from '@/store/authStore'
import useProcessingStore from '@/store/processingStore'
import useToastStore from '@/store/toastStore'
import useActivityStore from '@/store/activityStore'
import { api } from '@/services/api'

const POLL_INTERVAL_MS = 5000
const MAX_ELAPSED_MS = 20 * 60 * 1000 // 20 minutes

export default function ProcessingManager() {
  const user = useAuthStore((s) => s.user)
  const inFlightRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (user?.role !== 'school_admin') return

    const tick = () => {
      const { chapters, updateStatus, removeChapter } = useProcessingStore.getState()
      const { addToast } = useToastStore.getState()

      for (const [chapterId, meta] of Object.entries(chapters)) {
        if (meta.status === 'done' || meta.status === 'error') continue
        if (inFlightRef.current.has(chapterId)) continue

        if (Date.now() - meta.startedAt > MAX_ELAPSED_MS) {
          updateStatus(chapterId, 'error')
          useActivityStore.getState().updateEntry(chapterId, { status: 'error' })
          addToast(`${meta.chapterTitle} — Processing timed out`, {
            variant: 'error',
            duration: 0,
          })
          continue
        }

        inFlightRef.current.add(chapterId)

        api.books
          .getStatus(chapterId)
          .then((status) => {
            const { chapters: current, updateStatus: update, removeChapter: remove } =
              useProcessingStore.getState()
            const currentMeta = current[chapterId]
            if (!currentMeta) return

            const allDone =
              status.has_content &&
              status.has_questions &&
              !status.is_processing &&
              !status.is_generating_questions

            const questionsFailed =
              status.has_content &&
              !status.has_questions &&
              !status.is_processing &&
              !status.is_generating_questions

            if (allDone) {
              update(chapterId, 'done')
              useActivityStore.getState().updateEntry(chapterId, { status: 'done' })
              useToastStore.getState().addToast(`${currentMeta.chapterTitle} is ready`, {
                description: 'Content and questions generated successfully',
                variant: 'success',
                duration: 6000,
              })
              setTimeout(() => remove(chapterId), 3000)
            } else if (questionsFailed) {
              update(chapterId, 'error')
              useActivityStore.getState().updateEntry(chapterId, { status: 'error' })
              useToastStore.getState().addToast(`${currentMeta.chapterTitle} — Questions failed`, {
                description: 'Content saved. Use Question Bank to retry.',
                variant: 'error',
                duration: 0,
              })
            } else if (status.is_generating_questions) {
              update(chapterId, 'questions_generating')
            } else if (status.is_processing) {
              update(chapterId, 'content_generating')
            }
          })
          .catch(() => {
            // Network blip — silent, keep trying next tick
          })
          .finally(() => {
            inFlightRef.current.delete(chapterId)
          })
      }
    }

    const id = setInterval(tick, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [user?.role])

  return null
}
