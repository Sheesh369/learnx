import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bot, Upload, Loader2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { api } from '@/services/api'
import type { Grade, Subject, Chapter } from '@/services/api'
import { useDocTitle } from '@/lib/useDocTitle'

type Step = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function AIProcessor() {
  useDocTitle('AI Textbook Processor')
  const navigate = useNavigate()

  // Setup state
  const [grades, setGrades] = useState<Grade[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')

  // New entity creation
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterNum, setNewChapterNum] = useState(1)

  // File + processing
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [chapterIdToProcess, setChapterIdToProcess] = useState('')
  const [contentReady, setContentReady] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load grades on mount
  useEffect(() => {
    api.grades.list().then(setGrades).catch(() => {})
  }, [])

  // Load subjects when grade changes
  useEffect(() => {
    if (!selectedGrade) { setSubjects([]); setSelectedSubject(''); return }
    api.grades.listSubjects(selectedGrade).then(setSubjects).catch(() => {})
    setSelectedSubject('')
    setChapters([])
    setSelectedChapter('')
  }, [selectedGrade])

  // Load chapters when subject changes
  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setSelectedChapter(''); return }
    api.chapters.list(selectedSubject).then(setChapters).catch(() => {})
    setSelectedChapter('')
  }, [selectedSubject])

  const createGrade = async () => {
    const g = await api.grades.create({ standard: grades.length + 1, board: 'CBSE' })
    setGrades(prev => [...prev, g])
    setSelectedGrade(g.id)
  }

  const createSubject = async () => {
    if (!selectedGrade || !newSubjectName.trim()) return
    const s = await api.grades.createSubject(selectedGrade, {
      name: newSubjectName.trim(),
      code: newSubjectName.trim().slice(0, 3).toUpperCase(),
    })
    setSubjects(prev => [...prev, s])
    setSelectedSubject(s.id)
    setNewSubjectName('')
  }

  const createChapter = async () => {
    if (!selectedSubject || !newChapterTitle.trim()) return
    const c = await api.chapters.create({
      number: newChapterNum,
      title: newChapterTitle.trim(),
      subject_id: selectedSubject,
    })
    setChapters(prev => [...prev, c])
    setSelectedChapter(c.id)
    setNewChapterTitle('')
  }

  const startPolling = (chapId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

    pollIntervalRef.current = setInterval(async () => {
      try {
        const status = await api.books.getStatus(chapId)
        if (status.has_content) {
          setContentReady(true)
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
        }
      } catch {
        // Silent fail on poll error, interval continues
      }
    }, 4000)
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  const handleProcess = async () => {
    const chapId = selectedChapter || chapterIdToProcess
    if (!chapId) { setStatusMsg('Select or enter a chapter ID'); return }
    if (!file) { setStatusMsg('Select a PDF file'); return }

    try {
      setStep('uploading')
      setStatusMsg('Uploading PDF to GCS...')
      await api.books.uploadPdf(chapId, file)

      setStep('processing')
      setStatusMsg('')
      const res = await api.books.process(chapId)

      setStep('done')
      setContentReady(false)
      startPolling(chapId)
    } catch (e: unknown) {
      setStep('error')
      setStatusMsg(e instanceof Error ? e.message : 'Something went wrong')
      stopPolling()
    }
  }

  const handleViewContent = () => {
    stopPolling()
    navigate(`/admin/classes/${selectedGrade}/${selectedSubject}/${selectedChapter}`)
  }

  const stepIcon = {
    idle: null,
    uploading: <Loader2 className="w-5 h-5 animate-spin text-primary-600" />,
    processing: <Loader2 className="w-5 h-5 animate-spin text-amber-500" />,
    done: <CheckCircle className="w-5 h-5 text-success-600" />,
    error: <AlertCircle className="w-5 h-5 text-danger-600" />,
  }

  const stepColor = {
    idle: '',
    uploading: 'bg-primary-50 border-primary-200 text-primary-800',
    processing: 'bg-amber-50 border-amber-200 text-amber-800',
    done: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-700',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-neutral-900">AI Textbook Processor</h1>
          <p className="text-sm text-neutral-500">Upload a chapter PDF and let Gemini simplify, find videos, generate images & extract glossary.</p>
        </div>
      </div>

      {/* Step 1 — Select / create grade */}
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
              onChange={e => setSelectedGrade(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm pr-10"
            >
              <option value="">Select a grade...</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>Class {g.standard} — {g.board}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Step 2 — Select / create subject */}
      {selectedGrade && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">2. Subject</h2>
          {subjects.length > 0 && (
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm pr-10"
              >
                <option value="">Select a subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
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

      {/* Step 3 — Select / create chapter */}
      {selectedSubject && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">3. Chapter</h2>
          {chapters.length > 0 && (
            <div className="relative">
              <select
                value={selectedChapter}
                onChange={e => setSelectedChapter(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm pr-10"
              >
                <option value="">Select a chapter...</option>
                {chapters.map(c => <option key={c.id} value={c.id}>Ch {c.number}: {c.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              value={newChapterNum}
              onChange={e => setNewChapterNum(Number(e.target.value))}
              className="w-20 px-3 py-2.5 border border-neutral-300 rounded-xl text-sm text-center"
              min={1}
            />
            <input
              value={newChapterTitle}
              onChange={e => setNewChapterTitle(e.target.value)}
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

      {/* Step 4 — Upload PDF + Process */}
      {(selectedChapter || chapterIdToProcess) && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-neutral-700 uppercase tracking-wide">4. Upload Textbook PDF</h2>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-colors cursor-pointer"
          >
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            {file ? (
              <p className="text-sm font-semibold text-primary-700">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
            ) : (
              <p className="text-sm text-neutral-500">Click to select PDF (max 50 MB)</p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Processing banner */}
          {step === 'processing' && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">Generating content… this may take a few minutes.</p>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!file || step === 'uploading' || step === 'processing'}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {(step === 'uploading' || step === 'processing')
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Bot className="w-4 h-4" />
            }
            {step === 'uploading' ? 'Uploading...' : step === 'processing' ? 'Triggering Agent...' : 'Upload & Process with AI'}
          </button>
        </div>
      )}

      {/* Status message for errors during upload */}
      {statusMsg && step === 'error' && (
        <div className={`flex items-start gap-3 px-4 py-3 border rounded-xl text-sm ${stepColor[step]}`}>
          {stepIcon[step]}
          <p>{statusMsg}</p>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          {/* Content status banner */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${contentReady ? 'bg-success-50 border border-success-200 text-success-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
            {contentReady ? (
              <>
                <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0" />
                <p className="font-medium">Content is ready! You can view it now.</p>
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                <p className="font-medium">Agent queued! Content generation is running in the background.</p>
              </>
            )}
          </div>

          {/* View Content button */}
          <button
            onClick={handleViewContent}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            View Content
          </button>

          {/* Info box */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 text-sm text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-800">What the agent does:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Simplifies the chapter text with structure and headings</li>
              <li>Finds relevant YouTube videos</li>
              <li>Generates grade-appropriate illustrative images</li>
              <li>Extracts glossary words with definitions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
