import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Bot, Loader2, FileText, Pencil, Trash2, GripVertical, X, Check } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
  useSortable, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDocTitle } from '@/lib/useDocTitle'
import ConfirmModal from '@/components/shared/ConfirmModal'
import { api } from '@/services/api'
import type { Grade, Subject, Chapter } from '@/services/api'
import useAuthStore from '@/store/authStore'
import useToastStore from '@/store/toastStore'

// ── Sortable row used in reorder mode ────────────────────────────────────────

function SortableChapterRow({ chapter }: { chapter: Chapter }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: chapter.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-4 px-5 py-4 border-b border-neutral-100 last:border-0 bg-white select-none"
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 shrink-0"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary-700">{chapter.number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate">{chapter.title}</p>
        {chapter.description && (
          <p className="text-xs text-neutral-400 truncate mt-0.5">{chapter.description}</p>
        )}
      </div>
    </div>
  )
}

// ── Edit chapter modal content ────────────────────────────────────────────────

interface EditState { chapter: Chapter; title: string; description: string }

export default function SubjectChapters() {
  useDocTitle('Chapters')
  const { classId, subjectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'school_admin'
  const addToast = useToastStore(s => s.addToast)

  const [grade, setGrade] = useState<Grade | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit modal
  const [editState, setEditState] = useState<EditState | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Reorder mode
  const [reorderMode, setReorderMode] = useState(false)
  const [reorderItems, setReorderItems] = useState<Chapter[]>([])
  const savedOrder = useRef<Chapter[]>([])
  const [savingOrder, setSavingOrder] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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

  // ── Edit ────────────────────────────────────────────────────────────────────

  const saveEdit = async () => {
    if (!editState) return
    setSavingEdit(true)
    try {
      const updated = await api.chapters.update(editState.chapter.id, {
        title: editState.title.trim(),
        description: editState.description.trim() || undefined,
      })
      setChapters(prev => prev.map(c => c.id === updated.id ? updated : c))
      addToast('Chapter updated', { variant: 'success' })
      setEditState(null)
    } catch {
      addToast('Failed to update chapter', { variant: 'error' })
    } finally {
      setSavingEdit(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.chapters.delete(deleteTarget.id)
      setChapters(prev => prev.filter(c => c.id !== deleteTarget.id))
      addToast('Chapter deleted', { variant: 'success' })
      setDeleteTarget(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete chapter', { variant: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  // ── Reorder ─────────────────────────────────────────────────────────────────

  const enterReorder = () => {
    savedOrder.current = [...chapters]
    setReorderItems([...chapters])
    setReorderMode(true)
  }

  const cancelReorder = () => {
    setReorderItems([...savedOrder.current])
    setReorderMode(false)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setReorderItems(prev => {
        const from = prev.findIndex(c => c.id === active.id)
        const to = prev.findIndex(c => c.id === over.id)
        return arrayMove(prev, from, to)
      })
    }
  }

  const saveOrder = async () => {
    if (!subjectId) return
    setSavingOrder(true)
    try {
      const items = reorderItems.map((c, i) => ({ id: c.id, number: i + 1 }))
      const updated = await api.chapters.reorder(subjectId, items)
      setChapters(updated.sort((a, b) => a.number - b.number))
      setReorderMode(false)
      addToast('Chapter order saved', { variant: 'success' })
    } catch (e) {
      // Revert to saved order on error
      setReorderItems([...savedOrder.current])
      addToast(e instanceof Error ? e.message : 'Failed to save order', { variant: 'error' })
    } finally {
      setSavingOrder(false)
    }
  }

  const displayChapters = reorderMode ? reorderItems : chapters

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
        <div className="flex items-center gap-2 flex-wrap">
          {reorderMode ? (
            <>
              <button
                onClick={cancelReorder}
                disabled={savingOrder}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveOrder}
                disabled={savingOrder}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50"
              >
                {savingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Order
              </button>
            </>
          ) : (
            <>
              {isAdmin && chapters.length > 1 && (
                <button
                  onClick={enterReorder}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-700 border border-neutral-200 rounded-xl hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  <GripVertical className="w-4 h-4" />
                  Reorder
                </button>
              )}
              <Link
                to="/admin/ai-processor"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Bot className="w-4 h-4" />
                Add via AI Processor
              </Link>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {reorderMode && (
        <p className="text-sm text-neutral-500">
          Drag chapters into the order you want, then click <strong>Save Order</strong>.
        </p>
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
      ) : reorderMode ? (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={reorderItems.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {reorderItems.map(ch => (
                <SortableChapterRow key={ch.id} chapter={ch} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          {displayChapters.map((ch) => (
            <div
              key={ch.id}
              className="group flex items-center gap-4 px-5 py-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
            >
              <button
                onClick={() => navigate(`/admin/classes/${classId}/${subjectId}/${ch.id}`)}
                className="flex items-center gap-4 flex-1 min-w-0 text-left"
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

              {isAdmin && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => setEditState({ chapter: ch, title: ch.title, description: ch.description ?? '' })}
                    className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ch)}
                    className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !savingEdit && setEditState(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-neutral-900">Edit Chapter</h2>
              <button onClick={() => !savingEdit && setEditState(null)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editState.title}
                  onChange={e => setEditState(s => s ? { ...s, title: e.target.value } : s)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Description <span className="text-neutral-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  value={editState.description}
                  onChange={e => setEditState(s => s ? { ...s, description: e.target.value } : s)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setEditState(null)} disabled={savingEdit} className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit || !editState.title.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50"
              >
                {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={`Delete Chapter ${deleteTarget.number}?`}
          message={`This will permanently delete "${deleteTarget.title}" and all its content and questions. This cannot be undone.`}
          confirmLabel="Delete Chapter"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => !deleting && setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
