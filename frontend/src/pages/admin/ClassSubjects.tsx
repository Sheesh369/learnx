import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Loader2, BookOpen } from 'lucide-react'
import { useDocTitle } from '@/lib/useDocTitle'
import { api } from '@/services/api'
import type { Grade, Subject } from '@/services/api'

const SUBJECT_ICONS: Record<string, string> = {
  english: '📖', kannada: '🏛️', hindi: '📝', mathematics: '🔢', math: '🔢',
  science: '🔬', 'social science': '🌍', 'social studies': '🌍', history: '🌍',
  computer: '💻', evs: '🌿', 'physical education': '⚽', physics: '⚡',
  chemistry: '🧪', biology: '🧬', geography: '🗺️', economics: '📊',
}

const SUBJECT_COLORS = [
  'from-primary-500 to-secondary-500',
  'from-secondary-500 to-accent-500',
  'from-purple-500 to-purple-600',
  'from-success-500 to-success-600',
  'from-info-500 to-info-600',
  'from-orange-500 to-danger-500',
  'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600',
]

function getSubjectIcon(name: string): string {
  const key = name.toLowerCase()
  return Object.entries(SUBJECT_ICONS).find(([k]) => key.includes(k))?.[1] ?? '📚'
}

export default function ClassSubjects() {
  useDocTitle('Subjects')
  const { classId } = useParams()
  const navigate = useNavigate()

  const [grade, setGrade] = useState<Grade | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!classId) return
    Promise.all([
      api.grades.list(),
      api.grades.listSubjects(classId),
    ])
      .then(([grades, subs]) => {
        setGrade(grades.find(g => g.id === classId) ?? null)
        setSubjects(subs)
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [classId])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/admin/classes" className="text-neutral-400 hover:text-primary-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Classes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="font-semibold text-neutral-900">
          {grade ? `Class ${grade.standard}` : '...'}
        </span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">
          {grade ? `Class ${grade.standard} — Subjects` : 'Subjects'}
        </h1>
        {!loading && (
          <p className="text-sm text-neutral-500 mt-1">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
            {grade ? ` • ${grade.board} Board` : ''}
          </p>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm mb-2">No subjects yet for this grade.</p>
          <p className="text-neutral-400 text-xs">Add subjects via the AI Processor.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => navigate(`/admin/classes/${classId}/${sub.id}`)}
              className="group bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${SUBJECT_COLORS[idx % SUBJECT_COLORS.length]} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                  {getSubjectIcon(sub.name)}
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
              </div>
              <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">{sub.name}</h3>
              <p className="text-xs text-neutral-400">{sub.code}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
