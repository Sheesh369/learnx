import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Plus, Loader2, Pencil, Trash2, Check, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import ConfirmModal from '@/components/shared/ConfirmModal'
import { useDocTitle } from '@/lib/useDocTitle'
import { api } from '@/services/api'
import type { Grade } from '@/services/api'
import useAuthStore from '@/store/authStore'
import useActivityStore from '@/store/activityStore'
import useToastStore from '@/store/toastStore'

const BOARDS = ['CBSE', 'KSEEB'] as const

export default function ClassManagement() {
  const navigate = useNavigate()
  useDocTitle('Classes')

  const { user } = useAuthStore()
  const isAdmin = user?.role === 'school_admin'
  const addToast = useToastStore(s => s.addToast)

  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  // Inline board edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBoard, setEditBoard] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null)
  const [deleting, setDeleting] = useState(false)

  const selectRef = useRef<HTMLSelectElement>(null)

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
      useActivityStore.getState().addEntry({
        type: 'grade_created',
        title: 'Grade Created',
        description: `Class ${g.standard} · ${g.board}`,
      })
    } catch {
      setError('Failed to create grade')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (grade: Grade, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(grade.id)
    setEditBoard(grade.board)
    setTimeout(() => selectRef.current?.focus(), 50)
  }

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
  }

  const saveEdit = async (grade: Grade, e: React.MouseEvent) => {
    e.stopPropagation()
    if (editBoard === grade.board) { setEditingId(null); return }
    setSavingEdit(true)
    try {
      const updated = await api.grades.update(grade.id, { board: editBoard })
      setGrades(prev => prev.map(g => g.id === grade.id ? updated : g))
      addToast('Board updated', { variant: 'success' })
      setEditingId(null)
    } catch {
      addToast('Failed to update board', { variant: 'error' })
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.grades.delete(deleteTarget.id)
      setGrades(prev => prev.filter(g => g.id !== deleteTarget.id))
      addToast(`Class ${deleteTarget.standard} deleted`, { variant: 'success' })
      setDeleteTarget(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete class', { variant: 'error' })
    } finally {
      setDeleting(false)
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
          {grades.map((grade) => {
            const isEditing = editingId === grade.id
            return (
              <div key={grade.id} className="relative group">
                <button
                  onClick={() => !isEditing && navigate(`/admin/classes/${grade.id}`)}
                  className="w-full bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-white font-display font-bold text-xl">{grade.standard}</span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">Class {grade.standard}</h3>

                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-2" onClick={e => e.stopPropagation()}>
                      <select
                        ref={selectRef}
                        value={editBoard}
                        onChange={e => setEditBoard(e.target.value)}
                        className="flex-1 text-xs border border-neutral-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                      >
                        {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <button
                        onClick={e => saveEdit(grade, e)}
                        disabled={savingEdit}
                        className="p-1 text-success-600 hover:bg-success-50 rounded"
                      >
                        {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-neutral-400 hover:bg-neutral-100 rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-neutral-400 mb-3">{grade.board}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                          <BookOpen className="w-4 h-4 text-primary-400" />
                          <span>View Subjects</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </>
                  )}
                </button>

                {isAdmin && !isEditing && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => startEdit(grade, e)}
                      className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-400 hover:text-primary-600 hover:border-primary-300 shadow-sm transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(grade) }}
                      className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-400 hover:text-danger-600 hover:border-danger-300 shadow-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Delete Class ${deleteTarget.standard}?`}
          message={`This will permanently delete Class ${deleteTarget.standard} and all its subjects, chapters, content, and questions. This cannot be undone.`}
          confirmLabel="Delete Class"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
