import { useState } from 'react'
import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react'
import CLASS_CONFIG, { getSubjectSlug, getSubjectChapters } from '@/lib/classConfig'
import useAuthStore from '@/store/authStore'

interface CurriculumTreeProps {
  onSelectChapter: (chapter: { id: string; number: number; title: string }, subject: { name: string }, cls: number) => void
  selectedChapterId?: string
}

export default function CurriculumTree({ onSelectChapter, selectedChapterId }: CurriculumTreeProps) {
  const { user } = useAuthStore()
  const classNum = parseInt(user?.class || '9', 10)
  const config = CLASS_CONFIG[classNum] || CLASS_CONFIG[9]

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)

  return (
    <div className="space-y-1">
      {config.subjects.map((sub) => {
        const slug = getSubjectSlug(sub.name)
        const chapters = getSubjectChapters(slug)
        const isExpanded = expandedSubject === sub.name

        return (
          <div key={sub.name}>
            <button
              onClick={() => setExpandedSubject(isExpanded ? null : sub.name)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-sm font-medium transition-colors ${
                isExpanded ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span className="text-base">{sub.icon}</span>
              <span className="flex-1 truncate">{sub.name}</span>
              {isExpanded
                ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                : <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              }
            </button>

            {isExpanded && (
              <div className="ml-4 pl-3 border-l border-neutral-200 mt-1 space-y-0.5">
                {chapters.map((ch, idx) => {
                  const chapterId = `${slug}-ch-${idx + 1}`
                  const isSelected = selectedChapterId === chapterId
                  return (
                    <button
                      key={chapterId}
                      onClick={() => onSelectChapter(
                        { id: chapterId, number: idx + 1, title: ch.title },
                        { name: sub.name },
                        classNum
                      )}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      <BookOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">Ch {idx + 1}: {ch.title}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
