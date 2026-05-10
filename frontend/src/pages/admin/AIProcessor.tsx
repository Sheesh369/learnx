import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Upload, Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { api } from '@/services/api'
import type { Grade, Subject, Chapter } from '@/services/api'
import useProcessingStore from '@/store/processingStore'
import useActivityStore from '@/store/activityStore'
import { useDocTitle } from '@/lib/useDocTitle'

type UploadStep = 'idle' | 'uploading' | 'error'

export default function AIProcessor() {
  useDocTitle('AI Textbook Processor')
  const navigate = useNavigate()
  const { addChapter, chapters } = useProcessingStore()

  // Setup state
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapterList, setChapterList] = useState<Chapter[]>([])
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')

  // New entity creation
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterNum, setNewChapterNum] = useState(1)

  // Upload state only — processing tracked globally in processingStore
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<UploadStep>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Read processing status from global store for the selected chapter
  const chapterStatus = selectedChapter ? chapters[selectedChapter] : undefined

  // Load grades on mount
  useEffect(() => {
    api.grades.list().then(setGrades).catch(() => {})
  }, [])

  // Load subjects when grade changes
  useEffect(() => {
    if (!selectedGrade) { setSubjects([]); setSelectedSubject(''); return }
    api.grades.listSubjects(selectedGrade).then(setSubjects).catch(() => {})
    setSelectedSubject('')
    setChapterList([])
    setSelectedChapter('')
  }, [selectedGrade])

  // Load chapters when subject changes
  useEffect(() => {
    if (!selectedSubject) { setChapterList([]); setSelectedChapter(''); return }
    api.chapters.list(selectedSubject).then(setChapterList).catch(() => {})
    setSelectedChapter('')
  }, [selectedSubject])

  // Warn only during upload (fast, reversible — processing is background)
  useEffect(() => {
    if (step !== 'uploading') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [step])

  const createGrade = async () => {
    const g = await api.grades.create({ standard: grades.length + 1, board: 'CBSE' })
    setGrades((prev) => [...prev, g])
    setSelectedGrade(g.id)
  }

  const createSubject = async () => {
    if (!selectedGrade || !newSubjectName.trim()) return
    const s = await api.grades.createSubject(selectedGrade, {
      name: newSubjectName.trim(),
      code: newSubjectName.trim().slice(0, 3).toUpperCase(),
    })
    setSubjects((prev) => [...prev, s])
    setSelectedSubject(s.id)
    setNewSubjectName('')
    const gradeStandard = grades.find((g) => g.id === selectedGrade)?.standard
    useActivityStore.getState().addEntry({
      type: 'subject_created',
      title: 'Subject Created',
      description: `${s.name}${gradeStandard ? ` · Class ${gradeStandard}` : ''}`,
    })
  }

  const createChapter = async () => {
    if (!selectedSubject || !newChapterTitle.trim()) return
    const c = await api.chapters.create({
      number: newChapterNum,
      title: newChapterTitle.trim(),
      subject_id: selectedSubject,
    })
    setChapterList((prev) => [...prev, c])
    setSelectedChapter(c.id)
    setNewChapterTitle('')
    useActivityStore.getState().addEntry({
      type: 'chapter_created',
      title: 'Chapter Created',
      description: `Ch ${c.number}: ${c.title}`,
    })
  }

  const handleProcess = async () => {
    if (!selectedChapter || !file) return

    setStep('uploading')
    setErrorMsg('')

    try {
      await api.books.uploadPdf(selectedChapter, file)
      await api.books.process(selectedChapter)

      const grade = grades.find((g) => g.id === selectedGrade)
      const subject = subjects.find((s) => s.id === selectedSubject)
      const chapter = chapterList.find((c) => c.id === selectedChapter)

      addChapter({
        chapterId: selectedChapter,
        chapterTitle: chapter?.title ?? selectedChapter,
        subjectName: subject?.name ?? '',
        gradeName: grade ? `Class ${grade.standard}` : '',
      })

      useActivityStore.getState().addEntry({
        id: selectedChapter,
        type: 'ai_generation',
        title: 'AI Processing',
        description: [
          grade ? `Class ${grade.standard}` : '',
          subject?.name ?? '',
          chapter ? `Ch ${chapter.number}: ${chapter.title}` : selectedChapter,
        ].filter(Boolean).join(' · '),
        status: 'in_progress',
        chapterId: selectedChapter,
        chapterTitle: chapter?.title ?? selectedChapter,
        subjectName: subject?.name ?? '',
        gradeName: grade ? `Class ${grade.standard}` : '',
      })

      setStep('idle')
      setFile(null)
    } catch (e: unknown) {
      setStep('error')
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  const handleViewContent = () => {
    navigate(`/admin/classes/${selectedGrade}/${selectedSubject}/${selectedChapter}`)
  }

  const isProcessingThisChapter =
    !!chapterStatus && chapterStatus.status !== 'done' && chapterStatus.status !== 'error'

  const isContentReady = chapterStatus?.status === 'done'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-neutral-900">AI Textbook Processor</h1>
          <p className="text-sm text-neutral-500">
            Upload a chapter PDF and let Gemini simplify, find videos, generate images, extract glossary & create questions.
          </p>
        </div>
      </div>

      {/* Step 1 — Grade */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">1. Grade</h2>
        {grades.length === 0 ? (
          <button onClick={createGrade} className="text-sm text-primary-600 font-semibold hover:underline">
            + Create first grade (Class 1, CBSE)
          </button>
        ) : (
          <div className="relative">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm pr-10"
            >
              <option value="">Select a grade...</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>Class {g.standard} — {g.board}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Step 2 — Subject */}
      {selectedGrade && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">2. Subject</h2>
          {subjects.length > 0 && (
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm pr-10"
              >
                <option value="">Select a subject...</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="New subject name (e.g. Science)"
              className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-xl text-sm"
            />
            <button
              onClick={createSubject}
              disabled={!newSubjectName.trim()}
              className="px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Chapter */}
      {selectedSubject && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">3. Chapter</h2>
          {chapterList.length > 0 && (
            <div className="relative">
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm pr-10"
              >
                <option value="">Select a chapter...</option>
                {chapterList.map((c) => (
                  <option key={c.id} value={c.id}>Ch {c.number}: {c.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              value={newChapterNum}
              onChange={(e) => setNewChapterNum(Number(e.target.value))}
              className="w-20 px-3 py-2.5 border border-neutral-300 rounded-xl text-sm text-center"
              min={1}
            />
            <input
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="New chapter title"
              className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-xl text-sm"
            />
            <button
              onClick={createChapter}
              disabled={!newChapterTitle.trim()}
              className="px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Upload + Process */}
      {selectedChapter && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">4. Upload Textbook PDF</h2>

          <label className="block border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            {file ? (
              <p className="text-sm font-semibold text-primary-700">
                {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            ) : (
              <p className="text-sm text-neutral-500">Click to select PDF (max 50 MB)</p>
            )}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setStep('idle') }}
            />
          </label>

          {/* Upload error */}
          {step === 'error' && errorMsg && (
            <div className="flex items-start gap-3 px-4 py-3 bg-danger-50 border border-danger-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
              <p className="text-sm text-danger-700">{errorMsg}</p>
            </div>
          )}

          {/* Global processing status for this chapter */}
          {isProcessingThisChapter && (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <p className="text-sm text-blue-800 font-medium">
                {chapterStatus?.status === 'questions_generating'
                  ? 'Content ready · Generating questions...'
                  : 'Generating content... You can navigate away safely.'}
              </p>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!file || step === 'uploading' || isProcessingThisChapter}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {step === 'uploading'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
              : <><Bot className="w-4 h-4" /> Upload &amp; Process with AI</>
            }
          </button>
        </div>
      )}

      {/* Content ready — view button */}
      {isContentReady && selectedChapter && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 bg-success-50 border border-success-200 rounded-xl text-sm">
            <CheckCircle className="w-4 h-4 text-success-600 shrink-0" />
            <p className="font-medium text-success-800">Content and questions are ready!</p>
          </div>
          <button
            onClick={handleViewContent}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            View Content
          </button>
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 text-sm text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-800">What the agent generates:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Simplified chapter text with headings and structure</li>
              <li>Relevant YouTube videos</li>
              <li>Grade-appropriate illustrative images</li>
              <li>Glossary words with definitions</li>
              <li>10 MCQ questions (3 easy, 5 medium, 2 hard)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
