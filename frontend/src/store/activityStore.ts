import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ActivityType =
  | 'ai_generation'
  | 'grade_created'
  | 'subject_created'
  | 'chapter_created'
  | 'teacher_upload'

export type ActivityStatus = 'in_progress' | 'done' | 'error'

export interface ActivityEntry {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: number
  // AI generation only
  status?: ActivityStatus
  chapterId?: string
  chapterTitle?: string
  subjectName?: string
  gradeName?: string
}

interface ActivityState {
  entries: ActivityEntry[]
  addEntry: (e: Omit<ActivityEntry, 'id' | 'timestamp'> & { id?: string }) => void
  updateEntry: (id: string, patch: Partial<ActivityEntry>) => void
  clearAll: () => void
}

const MAX_ENTRIES = 50

const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (e) =>
        set((s) => {
          const entry: ActivityEntry = {
            ...e,
            id: e.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: Date.now(),
          }
          const next = [entry, ...s.entries]
          return { entries: next.length > MAX_ENTRIES ? next.slice(0, MAX_ENTRIES) : next }
        }),

      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      clearAll: () => set({ entries: [] }),
    }),
    {
      name: 'learnexa-activity',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ entries: s.entries }),
    }
  )
)

export default useActivityStore
