import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui'
import { getClassConfig, getSubjectSlug } from '@/lib/classConfig'
import { useDocTitle } from '@/lib/useDocTitle'

export default function ClassSubjects() {
  useDocTitle('Subjects')
  const { classId } = useParams()
  const navigate = useNavigate()
  const config = getClassConfig(Number(classId) || 1)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/classes" className="text-neutral-400 hover:text-primary-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Classes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="font-semibold text-neutral-900">Class {classId}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Class {classId} — Subjects</h1>
        <p className="text-sm text-neutral-500 mt-1">{config.subjects.length} subjects • {config.board} Board</p>
      </div>

      {/* Subject cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {config.subjects.map((sub) => {
          const slug = getSubjectSlug(sub.name)
          return (
            <button
              key={slug}
              onClick={() => navigate(`/admin/classes/${classId}/${slug}`)}
              className="group bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{sub.icon}</div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
              </div>

              <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">{sub.name}</h3>
              <p className="text-xs text-neutral-500 mb-3">Teacher: {sub.teacher}</p>

              {sub.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sub.topics.map(t => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
