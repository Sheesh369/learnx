import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Loader2, BookOpen, Pencil, Trash2, X, Check } from 'lucide-react'
import { useDocTitle } from '@/lib/useDocTitle'
import ConfirmModal from '@/components/shared/ConfirmModal'
import { api } from '@/services/api'
import type { Grade, Subject } from '@/services/api'
import useAuthStore from '@/store/authStore'
import useToastStore from '@/store/toastStore'

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

interface EditModal {
  subject: Subject
  name: string
  code: string
}

export default function ClassSubjects() {
  useDocTitle('Subjects')
  const { classId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'school_admin'
  const addToast = useToastStore(s => s.addToast)

  const [grade, setGrade] = useState<Grade | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit modal
  const [editModal, setEditModal] = useState<EditModal | null>(null)
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!classId) return
    Promise.all([api.grades.list(), api.grades.listSubjects(classId)])
      .then(([grades, subs]) => {
        setGrade(grades.find(g => g.id === classId) ?? null)
        setSubjects(subs)
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [classId])

  const saveEdit = async () => {
    if (!editModal || !classId) return
    setEditError('')
    setSavingEdit(true)
    try {
      const updated = await api.grades.updateSubject(classId, editModal.subject.id, {
        name: editModal.name.trim(),
        code: editModal.code.trim().toUpperCase(),
      })
      setSubjects(prev => prev.map(s => s.id === updated.id ? updated : s))
      addToast('Subject updated', { variant: 'success' })
      setEditModal(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update subject'
      if (msg.includes('Code already used')) {
        setEditError('This code is already used by another subject in this class')
      } else {
        setEditError(msg)
      }
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !classId) return
    setDeleting(true)
    try {
      await api.grades.deleteSubject(classId, deleteTarget.id)
      setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id))
      addToast(`${deleteTarget.name} deleted`, { variant: 'success' })
      setDeleteTarget(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete subject', { variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

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
            <div key={sub.id} className="relative group">
              <button
                onClick={() => navigate(`/admin/classes/${classId}/${sub.id}`)}
                className="w-full bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 transition-all"
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

              {isAdmin && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); setEditModal({ subject: sub, name: sub.name, code: sub.code }); setEditError('') }}
                    className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-400 hover:text-primary-600 hover:border-primary-300 shadow-sm transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(sub) }}
                    className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-400 hover:text-danger-600 hover:border-danger-300 shadow-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Subject Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !savingEdit && setEditModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-neutral-900">Edit Subject</h2>
              <button onClick={() => !savingEdit && setEditModal(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <p className="text-sm text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">{editError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={e => { setEditModal(m => m ? { ...m, name: e.target.value } : m); setEditError('') }}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  value={editModal.code}
                  onChange={e => { setEditModal(m => m ? { ...m, code: e.target.value } : m); setEditError('') }}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditModal(null)}
                disabled={savingEdit}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit || !editModal.name.trim() || !editModal.code.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50"
              >
                {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.name}?`}
          message={`This will permanently delete ${deleteTarget.name} and all its chapters, content, and questions. This cannot be undone.`}
          confirmLabel="Delete Subject"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
