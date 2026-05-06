import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Bot, Loader2, FileText } from 'lucide-react'
import { useDocTitle } from '@/lib/useDocTitle'
import { api } from '@/services/api'
import type { Grade, Subject, Chapter } from '@/services/api'

export default function SubjectChapters() {
  useDocTitle('Chapters')
  const { classId, subjectId } = useParams()
  const navigate = useNavigate()

  const [grade, setGrade] = useState<Grade | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!classId || !subjectId) return
    Promise.all([
      api.grades.list(),
      api.grades.listSubjects(classId),
      api.chapters.list(subjectId),
    ])
      .then(([grades, subs, chaps]) => {
        setGrade(grades.find(g => g.id === classId) ?? null)
        setSubject(subs.find(s => s.id === subjectId) ?? null)
        setChapters(chaps.sort((a, b) => a.number - b.number))
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [classId, subjectId])

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <Link to="/admin/classes" className="text-neutral-400 hover:text-primary-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Classes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <Link to={`/admin/classes/${classId}`} className="text-neutral-400 hover:text-primary-600">
          {grade ? `Class ${grade.standard}` : '...'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="font-semibold text-neutral-900">{subject?.name ?? '...'}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            {subject ? `${subject.name} — Chapters` : 'Chapters'}
          </h1>
          {!loading && (
            <p className="text-sm text-neutral-500 mt-1">
              {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Link
          to="/admin/ai-processor"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Bot className="w-4 h-4" />
          Add via AI Processor
        </Link>
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
      ) : chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm mb-2">No chapters yet for this subject.</p>
          <p className="text-neutral-400 text-xs mb-6">Use the AI Processor to upload a textbook PDF and generate chapters.</p>
          <Link
            to="/admin/ai-processor"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl"
          >
            <Bot className="w-4 h-4" />
            Open AI Processor
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => navigate(`/admin/classes/${classId}/${subjectId}/${ch.id}`)}
              className="w-full flex items-center gap-4 px-5 py-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors text-left group"
            >
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary-700">{ch.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{ch.title}</p>
                {ch.description && (
                  <p className="text-xs text-neutral-400 truncate mt-0.5">{ch.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
