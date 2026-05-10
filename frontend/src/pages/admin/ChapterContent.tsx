import { Fragment, useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, Bot, Loader2, FileText, Video, Image,
  BookOpen, ExternalLink, GripVertical, Settings2, Check, Pencil, Trash2, X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
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
import type { Grade, Subject, Chapter, ContentItem, GlossaryEntry } from '@/services/api'
import useAuthStore from '@/store/authStore'
import useToastStore from '@/store/toastStore'
import useProcessingStore from '@/store/processingStore'

const YOUTUBE_RE = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=|^https?:\/\/youtu\.be\//

// ── Helpers ──────────────────────────────────────────────────────────────────

function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]
  if (!videoId) return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm underline">{title || url}</a>
  )
  return (
    <div className="space-y-1.5">
      <div className="rounded-xl overflow-hidden border border-neutral-200">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between">
        {title && <p className="text-xs font-medium text-neutral-700">{title}</p>}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 ml-auto"
        >
          <ExternalLink className="w-3 h-3" /> Watch
        </a>
      </div>
    </div>
  )
}

function GlossaryTooltip({ word, definition, synonym }: {
  word: string
  definition: string
  synonym: string | null
}) {
  return (
    <span className="relative inline group cursor-help">
      <span className="font-bold underline decoration-dotted decoration-primary-400 text-primary-700">
        {word}
      </span>
      <span className="absolute bottom-full left-0 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 w-64 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-xl pointer-events-none mb-1">
        <span className="font-semibold block mb-1">{word}</span>
        {definition}
        {synonym && <span className="block mt-1 text-neutral-400 italic">Also: {synonym}</span>}
      </span>
    </span>
  )
}

// ── Configure-mode card type metadata ────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  simplified_text: 'TEXT', note: 'NOTE',
  video_youtube: 'VIDEO', image: 'IMAGE', pdf: 'PDF',
}
const TYPE_BADGE: Record<string, string> = {
  simplified_text: 'bg-neutral-100 text-neutral-600',
  note:            'bg-neutral-100 text-neutral-600',
  video_youtube:   'bg-purple-100 text-purple-700',
  image:           'bg-blue-100 text-blue-700',
  pdf:             'bg-amber-100 text-amber-700',
}

// ── SortableCard — used only in configure mode ────────────────────────────────

interface SortableCardProps {
  item: ContentItem
  onEdit: (item: ContentItem) => void
  onDelete: (item: ContentItem) => void
}

function SortableCard({ item, onEdit, onDelete }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const label = (() => {
    if (item.content_type === 'simplified_text' || item.content_type === 'note') {
      const m = item.text_content?.match(/^#{1,3}\s+(.+)/m)
      return m ? m[1] : (item.title || 'Text Section')
    }
    return item.title || TYPE_LABEL[item.content_type]
  })()

  const preview = (() => {
    if (item.content_type === 'video_youtube' && item.youtube_url) {
      const vid = item.youtube_url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]
      if (vid) return (
        <img
          src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
          className="w-24 h-14 rounded-lg object-cover shrink-0 border border-neutral-200"
          alt=""
        />
      )
    }
    if (item.content_type === 'image' && item.gcs_url) {
      return (
        <img
          src={item.gcs_url}
          className="w-14 h-14 rounded-lg object-cover shrink-0 border border-neutral-200"
          alt=""
        />
      )
    }
    if (item.text_content) {
      const plain = item.text_content
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/[*_`]/g, '')
        .slice(0, 90)
      return <p className="text-xs text-neutral-400 truncate min-w-0">{plain}</p>
    }
    return null
  })()

  const canEdit = item.content_type === 'simplified_text' || item.content_type === 'note' || item.content_type === 'video_youtube'

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm select-none"
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 shrink-0 p-1 -ml-1 rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${TYPE_BADGE[item.content_type] ?? TYPE_BADGE.note}`}>
        {TYPE_LABEL[item.content_type] ?? 'BLOCK'}
      </span>

      <span className="text-sm font-medium text-neutral-800 truncate flex-1 min-w-0">{label}</span>

      {preview}

      <div className="flex items-center gap-1 shrink-0 ml-1">
        {canEdit && (
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Main page component ───────────────────────────────────────────────────────

export default function ChapterContent() {
  useDocTitle('Chapter Content')
  const { classId, subjectId, chapterId } = useParams()

  // Auth & toast
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'school_admin'
  const addToast = useToastStore((s) => s.addToast)

  // Disable configure while AI is actively processing this chapter
  const chapterStatus = useProcessingStore(
    (s) => (chapterId ? s.chapters[chapterId] : undefined)
  )
  const isProcessing =
    chapterStatus?.status === 'content_generating' ||
    chapterStatus?.status === 'questions_generating'

  // Page data
  const [grade, setGrade] = useState<Grade | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [contents, setContents] = useState<ContentItem[]>([])
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Configure-mode state
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [configItems, setConfigItems] = useState<ContentItem[]>([])
  const [saving, setSaving] = useState(false)

  // Edit content modals
  const [textEditItem, setTextEditItem] = useState<ContentItem | null>(null)
  const [textEditValue, setTextEditValue] = useState('')
  const [savingTextEdit, setSavingTextEdit] = useState(false)

  const [videoEditItem, setVideoEditItem] = useState<ContentItem | null>(null)
  const [videoEditTitle, setVideoEditTitle] = useState('')
  const [videoEditUrl, setVideoEditUrl] = useState('')
  const [videoUrlError, setVideoUrlError] = useState('')
  const [savingVideoEdit, setSavingVideoEdit] = useState(false)

  // Delete content
  const [deleteContentTarget, setDeleteContentTarget] = useState<ContentItem | null>(null)
  const [deletingContent, setDeletingContent] = useState(false)

  // Load page data
  useEffect(() => {
    if (!classId || !subjectId || !chapterId) return
    Promise.all([
      api.grades.list(),
      api.grades.listSubjects(classId),
      api.chapters.list(subjectId),
      api.content.listByChapter(chapterId),
      api.glossary.listByChapter(chapterId),
    ])
      .then(([grades, subs, chaps, items, words]) => {
        setGrade(grades.find(g => g.id === classId) ?? null)
        setSubject(subs.find(s => s.id === subjectId) ?? null)
        setChapter(chaps.find(c => c.id === chapterId) ?? null)
        setContents(items.sort((a, b) => a.order_index - b.order_index))
        setGlossary(words)
      })
      .catch(() => setError('Failed to load chapter content'))
      .finally(() => setLoading(false))
  }, [classId, subjectId, chapterId])

  // Glossary map for tooltip injection
  const glossaryMap = useMemo(
    () => new Map(glossary.map(e => [e.word.toLowerCase(), e])),
    [glossary]
  )

  // Markdown renderer with memoised glossary regex (fixes regex-per-render bug)
  const markdownComponents = useMemo(() => {
    let pattern: RegExp | null = null
    if (glossaryMap.size > 0) {
      const escaped = Array.from(glossaryMap.keys()).map(w =>
        w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      )
      pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
    }

    const injectTooltips = (text: string): React.ReactNode[] => {
      if (!pattern) return [text]
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null
      pattern.lastIndex = 0
      while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
        const entry = glossaryMap.get(match[0].toLowerCase())!
        parts.push(
          <GlossaryTooltip
            key={`${match[0]}-${match.index}`}
            word={match[0]}
            definition={entry.definition}
            synonym={entry.synonym}
          />
        )
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex))
      return parts.length ? parts : [text]
    }

    const process = (children: React.ReactNode): React.ReactNode => {
      if (typeof children === 'string') return injectTooltips(children)
      if (Array.isArray(children)) return children.map((c, i) =>
        typeof c === 'string' ? <Fragment key={i}>{injectTooltips(c)}</Fragment> : c
      )
      return children
    }

    return {
      p:  ({ children }: { children: React.ReactNode }) => <p>{process(children)}</p>,
      li: ({ children }: { children: React.ReactNode }) => <li>{process(children)}</li>,
    }
  }, [glossaryMap])

  // ── DnD ────────────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      setConfigItems(prev => {
        const from = prev.findIndex(i => i.id === active.id)
        const to   = prev.findIndex(i => i.id === over.id)
        return arrayMove(prev, from, to)
      })
    }
  }

  function enterConfigure() {
    setConfigItems([...contents])
    setIsConfiguring(true)
  }

  function cancelConfigure() {
    setIsConfiguring(false)
  }

  async function saveLayout() {
    setSaving(true)
    try {
      await api.content.bulkReorder(
        chapterId!,
        configItems.map((item, idx) => ({ id: item.id, order_index: idx })),
      )
      setContents(configItems.map((item, idx) => ({ ...item, order_index: idx })))
      setIsConfiguring(false)
      addToast('Layout saved', { variant: 'success' })
    } catch {
      addToast('Failed to save layout — try again', { variant: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ── Content edit/delete handlers ────────────────────────────────────────────

  function openEdit(item: ContentItem) {
    if (item.content_type === 'video_youtube') {
      setVideoEditItem(item)
      setVideoEditTitle(item.title)
      setVideoEditUrl(item.youtube_url ?? '')
      setVideoUrlError('')
    } else {
      setTextEditItem(item)
      setTextEditValue(item.text_content ?? '')
    }
  }

  async function saveTextEdit() {
    if (!textEditItem) return
    setSavingTextEdit(true)
    try {
      const updated = await api.content.update(textEditItem.id, { text_content: textEditValue })
      const patch = (items: ContentItem[]) => items.map(i => i.id === updated.id ? updated : i)
      setContents(patch)
      setConfigItems(patch)
      addToast('Content updated', { variant: 'success' })
      setTextEditItem(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update content', { variant: 'error' })
    } finally {
      setSavingTextEdit(false)
    }
  }

  async function saveVideoEdit() {
    if (!videoEditItem) return
    if (!YOUTUBE_RE.test(videoEditUrl)) {
      setVideoUrlError('Must be a YouTube URL (youtube.com/watch?v= or youtu.be/)')
      return
    }
    setSavingVideoEdit(true)
    try {
      const updated = await api.content.update(videoEditItem.id, { title: videoEditTitle, youtube_url: videoEditUrl })
      const patch = (items: ContentItem[]) => items.map(i => i.id === updated.id ? updated : i)
      setContents(patch)
      setConfigItems(patch)
      addToast('Video updated', { variant: 'success' })
      setVideoEditItem(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to update video', { variant: 'error' })
    } finally {
      setSavingVideoEdit(false)
    }
  }

  async function handleDeleteContent() {
    if (!deleteContentTarget) return
    setDeletingContent(true)
    try {
      await api.content.delete(deleteContentTarget.id)
      const remove = (items: ContentItem[]) => items.filter(i => i.id !== deleteContentTarget.id)
      setContents(remove)
      setConfigItems(remove)
      addToast('Content block removed', { variant: 'success' })
      setDeleteContentTarget(null)
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to delete content', { variant: 'error' })
    } finally {
      setDeletingContent(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
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
        <Link to={`/admin/classes/${classId}/${subjectId}`} className="text-neutral-400 hover:text-primary-600">
          {subject?.name ?? '...'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="font-semibold text-neutral-900">
          {chapter ? `Ch ${chapter.number}` : '...'}
        </span>
      </div>

      {/* Chapter header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {chapter && (
            <span className="inline-block text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg mb-2">
              CHAPTER {chapter.number}
            </span>
          )}
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            {chapter?.title ?? 'Chapter'}
          </h1>
          {chapter?.description && (
            <p className="text-sm text-neutral-500 mt-1">{chapter.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isConfiguring ? (
            <>
              <button
                onClick={cancelConfigure}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveLayout}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Check className="w-4 h-4" />}
                Save Layout
              </button>
            </>
          ) : (
            <>
              {isAdmin && contents.length > 0 && !isProcessing && (
                <button
                  onClick={enterConfigure}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-700 border border-neutral-200 rounded-xl hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                  Configure Layout
                </button>
              )}
              <Link
                to="/admin/ai-processor"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Bot className="w-4 h-4" />
                Process with AI
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

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : contents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm mb-2">No content yet for this chapter.</p>
          <p className="text-neutral-400 text-xs mb-6">
            Use the AI Processor to upload a PDF and let Gemini generate the content.
          </p>
          <Link
            to="/admin/ai-processor"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl"
          >
            <Bot className="w-4 h-4" />
            Open AI Processor
          </Link>
        </div>
      ) : isConfiguring ? (
        /* ── Configure mode: draggable block list ── */
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">
            Drag blocks into the order you want. Click <strong>Save Layout</strong> when done.
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={configItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {configItems.map(item => (
                  <SortableCard key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteContentTarget} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        /* ── View mode: sequential blocks by order_index ── */
        <div className="space-y-6">
          {contents.map(item => {
            switch (item.content_type) {
              case 'simplified_text':
              case 'note':
                return (
                  <div key={item.id} className="bg-white border border-neutral-200 rounded-2xl shadow-sm px-8 py-8">
                    {/* For 'note' items show the manually-set title.
                        For 'simplified_text' the ## heading inside the markdown is the header. */}
                    {item.content_type === 'note' && item.title && (
                      <h2 className="text-lg font-bold text-primary-700 mb-4">{item.title}</h2>
                    )}
                    {item.text_content && (
                      <div className="prose prose-sm prose-neutral max-w-none text-sm text-neutral-700 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {item.text_content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {item.is_ai_generated && (
                      <span className="inline-flex items-center gap-1 mt-4 text-[11px] text-neutral-400">
                        <Bot className="w-3 h-3" /> AI generated
                      </span>
                    )}
                  </div>
                )

              case 'video_youtube':
                return (
                  <div key={item.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-bold text-neutral-900">{item.title || 'Video'}</h3>
                    </div>
                    <div className="p-4">
                      <YouTubeEmbed url={item.youtube_url ?? ''} title={item.title} />
                    </div>
                  </div>
                )

              case 'image':
                return (
                  <div key={item.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={item.gcs_url ?? ''}
                      alt={item.title}
                      className="w-full h-auto object-cover"
                    />
                    {item.title && (
                      <p className="px-5 py-3 text-xs font-medium text-neutral-700 bg-neutral-50 border-t border-neutral-100">
                        {item.title}
                      </p>
                    )}
                  </div>
                )

              case 'pdf':
                return (
                  <a
                    key={item.id}
                    href={item.gcs_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-5 py-4 bg-white border border-neutral-200 rounded-2xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-info-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-info-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{item.title}</p>
                      <p className="text-xs text-neutral-400">PDF Document</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-neutral-300 shrink-0" />
                  </a>
                )
            }
          })}
        </div>
      )}

      {/* ── Text / Note edit modal ─────────────────────────────────────────── */}
      {textEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !savingTextEdit && setTextEditItem(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="font-display text-lg font-bold text-neutral-900">
                Edit {textEditItem.content_type === 'note' ? 'Note' : 'Text Block'}
              </h2>
              <button
                onClick={() => !savingTextEdit && setTextEditItem(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <textarea
                value={textEditValue}
                onChange={e => setTextEditValue(e.target.value)}
                rows={16}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 font-mono"
                placeholder="Enter markdown content..."
              />
              <p className="text-xs text-neutral-400 mt-1.5">Supports Markdown formatting</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100">
              <button
                onClick={() => setTextEditItem(null)}
                disabled={savingTextEdit}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveTextEdit}
                disabled={savingTextEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50"
              >
                {savingTextEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Video edit modal ───────────────────────────────────────────────── */}
      {videoEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !savingVideoEdit && setVideoEditItem(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-neutral-900">Edit Video</h2>
              <button
                onClick={() => !savingVideoEdit && setVideoEditItem(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Title</label>
                <input
                  type="text"
                  value={videoEditTitle}
                  onChange={e => setVideoEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="Video title..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={videoEditUrl}
                  onChange={e => { setVideoEditUrl(e.target.value); setVideoUrlError('') }}
                  className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 ${videoUrlError ? 'border-danger-400' : 'border-neutral-200'}`}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {videoUrlError && <p className="text-xs text-danger-600 mt-1">{videoUrlError}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setVideoEditItem(null)}
                disabled={savingVideoEdit}
                className="px-4 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveVideoEdit}
                disabled={savingVideoEdit || !videoEditUrl.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl disabled:opacity-50"
              >
                {savingVideoEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete content block confirmation ─────────────────────────────── */}
      {deleteContentTarget && (
        <ConfirmModal
          title="Delete content block?"
          message={`This will permanently remove "${deleteContentTarget.title || TYPE_LABEL[deleteContentTarget.content_type] || 'this block'}" from the chapter. This cannot be undone.`}
          confirmLabel="Delete Block"
          loading={deletingContent}
          onConfirm={handleDeleteContent}
          onClose={() => !deletingContent && setDeleteContentTarget(null)}
        />
      )}
    </div>
  )
}
