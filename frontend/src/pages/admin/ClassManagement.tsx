import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { getClassConfig } from '@/lib/classConfig'
import { useDocTitle } from '@/lib/useDocTitle'

const CLASSES = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1
  const config = getClassConfig(n)
  return { id: String(n), name: `Class ${n}`, subjectCount: config.subjects.length, board: config.board }
})

export default function ClassManagement() {
  const navigate = useNavigate()
  useDocTitle('Classes')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage all classes and their curriculum content."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CLASSES.map((cls) => (
          <button
            key={cls.id}
            onClick={() => navigate(`/admin/classes/${cls.id}`)}
            className="group bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all"
          >
            {/* Class number badge */}
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
              <span className="text-white font-display font-bold text-xl">{cls.id}</span>
            </div>

            <h3 className="font-display text-lg font-bold text-neutral-900 mb-2">{cls.name}</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <BookOpen className="w-4 h-4 text-primary-400" />
                <span>{cls.subjectCount} Subjects</span>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
