import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Plus, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDocTitle } from '@/lib/useDocTitle'
import { api } from '@/services/api'
import type { Grade } from '@/services/api'

export default function ClassManagement() {
  const navigate = useNavigate()
  useDocTitle('Classes')

  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.grades.list()
      .then(setGrades)
      .catch(() => setError('Failed to load grades'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddGrade = async () => {
    setCreating(true)
    try {
      const nextStandard = grades.length > 0
        ? Math.max(...grades.map(g => g.standard)) + 1
        : 1
      if (nextStandard > 10) return
      const g = await api.grades.create({ standard: nextStandard, board: 'CBSE' })
      setGrades(prev => [...prev, g].sort((a, b) => a.standard - b.standard))
    } catch {
      setError('Failed to create grade')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Manage all classes and their curriculum content."
        action={
          grades.length < 10 ? (
            <button
              onClick={handleAddGrade}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Grade
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="px-4 py-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : grades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm mb-4">No grades yet. Add your first grade to get started.</p>
          <button
            onClick={handleAddGrade}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Class 1
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => navigate(`/admin/classes/${grade.id}`)}
              className="group bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                <span className="text-white font-display font-bold text-xl">{grade.standard}</span>
              </div>

              <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">Class {grade.standard}</h3>
              <p className="text-xs text-neutral-400 mb-3">{grade.board}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                  <BookOpen className="w-4 h-4 text-primary-400" />
                  <span>View Subjects</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
