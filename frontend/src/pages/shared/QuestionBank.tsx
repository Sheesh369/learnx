import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Trash2, Brain, RotateCcw, ChevronRight, Loader2, BookOpen, FileText, Plus, Pencil, Upload, Download } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge, Button, EmptyState, Spinner } from '@/components/ui'
import QuestionModal from '@/components/shared/QuestionModal'
import { api, type QuestionOut, type Grade, type Subject, type Chapter } from '@/services/api'
import useAuthStore from '@/store/authStore'
import useProcessingStore from '@/store/processingStore'
import useToastStore from '@/store/toastStore'
import { useDocTitle } from '@/lib/useDocTitle'

// ── Constants ────────────────────────────────────────────────────────────────

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

const DIFF_BADGE: Record<string, 'green' | 'amber' | 'red'> = {
  easy: 'green', medium: 'amber', hard: 'red',
}

const OPTIONS = ['A', 'B', 'C', 'D'] as const
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const

type QBView = 'grades' | 'subjects' | 'chapters' | 'questions'

// ── Component ────────────────────────────────────────────────────────────────

export default function QuestionBank() {
  useDocTitle('Question Bank')
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'school_admin'
  const canSeeAnswers = user?.role === 'school_admin' || user?.role === 'teacher'
  const addToast = useToastStore((s) => s.addToast)

  // Navigation
  const [view, setView] = useState<QBView>('grades')
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  // Data
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapterList, setChapterList] = useState<Chapter[]>([])
  const [questions, setQuestions] = useState<QuestionOut[]>([])

  // UI
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Question modal (add / edit)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [modalQuestion, setModalQuestion] = useState<QuestionOut | null>(null)

  // Excel upload
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Processing awareness for selected chapter
  const chapterStatus = useProcessingStore(
    (s) => (selectedChapter ? s.chapters[selectedChapter.id] : undefined)
  )
  const { addChapter, updateStatus } = useProcessingStore()

  // Load grades once on mount
  useEffect(() => {
    api.grades.list().then(setGrades).catch(() => {})
  }, [])

  // ── Navigation handlers ──────────────────────────────────────────────────

  const selectGrade = async (grade: Grade) => {
    setSelectedGrade(grade)
    setSelectedSubject(null)
    setSelectedChapter(null)
    setQuestions([])
    setFetchError(false)
    setView('subjects')
    setLoading(true)
    try {
      const subs = await api.grades.listSubjects(grade.id)
      setSubjects(subs)
    } catch {
      // silent — shows empty state
    } finally {
      setLoading(false)
    }
  }

  const selectSubject = async (subject: Subject) => {
    setSelectedSubject(subject)
    setSelectedChapter(null)
    setQuestions([])
    setFetchError(false)
    setView('chapters')
    setLoading(true)
    try {
      const chaps = await api.chapters.list(subject.id)
      setChapterList(chaps.sort((a, b) => a.number - b.number))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const selectChapter = async (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setExpandedId(null)
    setFetchError(false)
    setView('questions')
    setLoading(true)
    try {
      const qs = await api.questions.list({ chapter_id: chapter.id })
      setQuestions(qs)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  // Breadcrumb back-navigation — reuses already-loaded data, no refetch
  const navToGrades = () => {
    setView('grades')
    setSelectedGrade(null)
    setSelectedSubject(null)
    setSelectedChapter(null)
    setQuestions([])
    setFetchError(false)
  }

  const navToSubjects = () => {
    setView('subjects')
    setSelectedSubject(null)
    setSelectedChapter(null)
    setQuestions([])
    setFetchError(false)
  }

  const navToChapters = () => {
    setView('chapters')
    setSelectedChapter(null)
    setQuestions([])
    setFetchError(false)
  }

  // ── Question actions ─────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await api.questions.delete(id)
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      addToast('Question deleted', { variant: 'success' })
    } catch {
      addToast('Failed to delete question', { variant: 'error' })
    }
  }

  const handleRegenerate = async () => {
    if (!selectedChapter) return
    try {
      await api.questions.generate(selectedChapter.id)
      if (!chapterStatus) {
        addChapter({
          chapterId: selectedChapter.id,
          chapterTitle: selectedChapter.title,
          subjectName: selectedSubject?.name ?? '',
          gradeName: selectedGrade ? `Class ${selectedGrade.standard}` : '',
        })
      }
      updateStatus(selectedChapter.id, 'questions_generating')
      addToast('Generating questions...', { variant: 'info', duration: 3000 })
    } catch (e: unknown) {
      addToast(
        e instanceof Error ? e.message : 'Failed to start question generation',
        { variant: 'error' }
      )
    }
  }

  const retryFetch = async () => {
    if (!selectedChapter) return
    setFetchError(false)
    setLoading(true)
    try {
      const qs = await api.questions.list({ chapter_id: selectedChapter.id })
      setQuestions(qs)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuestion = (saved: QuestionOut) => {
    setQuestions(prev => {
      const exists = prev.find(q => q.id === saved.id)
      return exists ? prev.map(q => q.id === saved.id ? saved : q) : [saved, ...prev]
    })
    addToast(modalMode === 'add' ? 'Question added' : 'Question updated', { variant: 'success' })
    setModalMode(null)
    setModalQuestion(null)
  }

  const handleUploadExcel = async (file: File) => {
    if (!selectedChapter) return
    setUploadingExcel(true)
    try {
      const result = await api.questions.uploadExcel(selectedChapter.id, file)
      const qs = await api.questions.list({ chapter_id: selectedChapter.id })
      setQuestions(qs)
      addToast(
        `Imported ${result.imported} question${result.imported !== 1 ? 's' : ''}${result.errors.length ? ` (${result.errors.length} row${result.errors.length !== 1 ? 's' : ''} skipped)` : ''}`,
        { variant: result.errors.length ? 'info' : 'success' }
      )
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Excel upload failed', { variant: 'error' })
    } finally {
      setUploadingExcel(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await api.questions.downloadTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'questions_template.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      addToast('Failed to download template', { variant: 'error' })
    }
  }

  // ── Breadcrumb ───────────────────────────────────────────────────────────

  const Breadcrumb = () => {
    if (view === 'grades') return null
    return (
      <nav className="flex items-center gap-1.5 text-sm flex-wrap">
        <button
          onClick={navToGrades}
          className="text-neutral-400 hover:text-primary-600 font-medium transition-colors"
        >
          Question Bank
        </button>

        {selectedGrade && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            {view === 'subjects' ? (
              <span className="font-semibold text-neutral-900">Class {selectedGrade.standard}</span>
            ) : (
              <button
                onClick={navToSubjects}
                className="text-neutral-400 hover:text-primary-600 font-medium transition-colors"
              >
                Class {selectedGrade.standard}
              </button>
            )}
          </>
        )}

        {selectedSubject && (view === 'chapters' || view === 'questions') && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            {view === 'chapters' ? (
              <span className="font-semibold text-neutral-900">{selectedSubject.name}</span>
            ) : (
              <button
                onClick={navToChapters}
                className="text-neutral-400 hover:text-primary-600 font-medium transition-colors"
              >
                {selectedSubject.name}
              </button>
            )}
          </>
        )}

        {selectedChapter && view === 'questions' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            <span className="font-semibold text-neutral-900 truncate max-w-[200px]">
              Ch {selectedChapter.number}: {selectedChapter.title}
            </span>
          </>
        )}
      </nav>
    )
  }

  // ── View: Grades ─────────────────────────────────────────────────────────

  if (view === 'grades') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Question Bank"
          description="Select a class to start browsing questions"
        />
        {grades.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-10 h-10" />}
            title="No classes yet"
            description="Add grades via Class Management and process chapters first"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {grades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => selectGrade(grade)}
                className="group bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-150"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform">
                  <span className="text-white font-display font-bold text-xl">{grade.standard}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">
                  Class {grade.standard}
                </h3>
                <p className="text-xs text-neutral-400 mb-4">{grade.board}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">View Subjects</span>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── View: Subjects ───────────────────────────────────────────────────────

  if (view === 'subjects') {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            Class {selectedGrade?.standard} — Subjects
          </h1>
          {!loading && (
            <p className="text-sm text-neutral-500 mt-1">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner text="Loading subjects..." />
          </div>
        ) : subjects.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-10 h-10" />}
            title="No subjects yet"
            description="Add subjects via the AI Processor"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub, idx) => (
              <button
                key={sub.id}
                onClick={() => selectSubject(sub)}
                className="group bg-white border border-neutral-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-150"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${SUBJECT_COLORS[idx % SUBJECT_COLORS.length]} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                    {getSubjectIcon(sub.name)}
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors mt-1" />
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

  // ── View: Chapters ───────────────────────────────────────────────────────

  if (view === 'chapters') {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            {selectedSubject?.name} — Chapters
          </h1>
          {!loading && (
            <p className="text-sm text-neutral-500 mt-1">
              {chapterList.length} chapter{chapterList.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner text="Loading chapters..." />
          </div>
        ) : chapterList.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-10 h-10" />}
            title="No chapters yet"
            description="Process a PDF with the AI Processor to generate chapters and questions"
          />
        ) : (
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {chapterList.map((ch) => (
              <button
                key={ch.id}
                onClick={() => selectChapter(ch)}
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

  // ── View: Questions ──────────────────────────────────────────────────────

  const renderQuestionBody = (): React.ReactNode => {
    if (loading) {
      return (
        <div className="flex justify-center py-20">
          <Spinner text="Loading questions..." />
        </div>
      )
    }

    if (fetchError) {
      return (
        <EmptyState
          icon={<Brain className="w-10 h-10" />}
          title="Failed to load questions"
          description="Check your connection and try again"
          action={<Button variant="outline" onClick={retryFetch}>Retry</Button>}
        />
      )
    }

    if (isAdmin && chapterStatus?.status === 'content_generating') {
      return (
        <EmptyState
          icon={<Loader2 className="w-10 h-10 animate-spin text-neutral-300" />}
          title="AI is generating content"
          description="Questions will be generated automatically once content is ready"
        />
      )
    }

    if (isAdmin && chapterStatus?.status === 'questions_generating') {
      return (
        <EmptyState
          icon={<Loader2 className="w-10 h-10 animate-spin text-neutral-300" />}
          title="Generating questions..."
          description="This usually takes under a minute"
        />
      )
    }

    if (questions.length === 0) {
      return (
        <EmptyState
          icon={<Brain className="w-10 h-10" />}
          title="No questions yet"
          description={
            isAdmin
              ? 'Process this chapter with AI Processor to auto-generate questions'
              : 'Questions for this chapter have not been added yet'
          }
          action={
            isAdmin ? (
              <Button icon={<RotateCcw className="w-4 h-4" />} onClick={handleRegenerate}>
                Generate Questions
              </Button>
            ) : undefined
          }
        />
      )
    }

    return (
      <div className="space-y-3">
        {questions.map((q, i) => {
          const isExpanded = expandedId === q.id
          const correctIndex = OPTIONS.indexOf(q.correct_option)

          return (
            <div
              key={q.id}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-xs font-bold text-neutral-400 mt-1 shrink-0">Q{i + 1}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <Badge color={DIFF_BADGE[q.difficulty]} size="md">
                        {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                      </Badge>
                      {q.is_ai_generated && (
                        <Badge color="blue" size="md">AI Generated</Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-900 font-medium leading-relaxed">
                      {q.question_text}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {OPTION_KEYS.map((key, idx) => {
                        const letter = OPTIONS[idx]
                        const isCorrect = q.correct_option === letter
                        const highlight = canSeeAnswers && isCorrect
                        return (
                          <div
                            key={letter}
                            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                              highlight
                                ? 'bg-success-50 border-success-200 text-success-800 font-semibold'
                                : 'bg-neutral-50 border-neutral-100 text-neutral-600'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              highlight
                                ? 'bg-success-200 text-success-800'
                                : 'bg-neutral-200 text-neutral-500'
                            }`}>
                              {letter}
                            </span>
                            {q[key]}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {canSeeAnswers && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => { setModalQuestion(q); setModalMode('edit') }}
                        className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && canSeeAnswers && (
                <div className="px-5 pb-4">
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary-700 mb-1">Correct Answer</p>
                    <p className="text-sm text-primary-900 font-medium">
                      Option {q.correct_option}
                      {correctIndex >= 0 && ` — ${q[OPTION_KEYS[correctIndex]]}`}
                    </p>
                  </div>
                </div>
              )}

              <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  Difficulty: {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                </span>
                {canSeeAnswers && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {isExpanded ? 'Hide Answer' : 'View Answer'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {selectedChapter && (
            <span className="inline-block text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg mb-2">
              CHAPTER {selectedChapter.number}
            </span>
          )}
          <h1 className="font-display text-2xl font-bold text-neutral-900">
            {selectedChapter?.title}
          </h1>
          {!loading && !fetchError && questions.length > 0 && (
            <p className="text-sm text-neutral-500 mt-1">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {isAdmin && selectedChapter && !loading && !fetchError && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 hover:border-neutral-300 text-sm font-semibold text-neutral-600 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingExcel}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 hover:border-primary-300 hover:text-primary-700 text-sm font-semibold text-neutral-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploadingExcel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Excel
            </button>
            {questions.length > 0 && (
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 hover:border-primary-300 hover:text-primary-700 text-sm font-semibold text-neutral-600 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </button>
            )}
            <button
              onClick={() => { setModalQuestion(null); setModalMode('add') }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        )}
      </div>

      {renderQuestionBody()}

      {/* Hidden file input for Excel upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadExcel(f) }}
      />

      {/* Add / Edit question modal */}
      {modalMode && selectedChapter && (
        <QuestionModal
          mode={modalMode}
          chapterId={selectedChapter.id}
          initial={modalQuestion ?? undefined}
          onSave={handleSaveQuestion}
          onClose={() => { setModalMode(null); setModalQuestion(null) }}
        />
      )}
    </div>
  )
}
