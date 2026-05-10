import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ProcessingStatus = 'content_generating' | 'questions_generating' | 'done' | 'error'

export interface ProcessingChapter {
  chapterId: string
  chapterTitle: string
  subjectName: string
  gradeName: string
  startedAt: number
  status: ProcessingStatus
}

interface ProcessingState {
  chapters: Record<string, ProcessingChapter>
  addChapter: (meta: Omit<ProcessingChapter, 'status' | 'startedAt'>) => void
  updateStatus: (chapterId: string, status: ProcessingStatus) => void
  removeChapter: (chapterId: string) => void
  clearAll: () => void
}

const useProcessingStore = create<ProcessingState>()(
  persist(
    (set) => ({
      chapters: {},

      addChapter: (meta) =>
        set((s) => ({
          chapters: {
            ...s.chapters,
            [meta.chapterId]: {
              ...meta,
              status: 'content_generating',
              startedAt: Date.now(),
            },
          },
        })),

      updateStatus: (chapterId, status) =>
        set((s) => {
          if (!s.chapters[chapterId]) return s
          return {
            chapters: {
              ...s.chapters,
              [chapterId]: { ...s.chapters[chapterId], status },
            },
          }
        }),

      removeChapter: (chapterId) =>
        set((s) => {
          const next = { ...s.chapters }
          delete next[chapterId]
          return { chapters: next }
        }),

      clearAll: () => set({ chapters: {} }),
    }),
    {
      name: 'learnexa-processing',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ chapters: s.chapters }),
    }
  )
)

export default useProcessingStore
