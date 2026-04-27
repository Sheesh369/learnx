import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, FileText, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Toast, FileUpload, Spinner, ProgressBar } from '@/components/ui'
import { getClassConfig, getSubjectSlug, getSubjectChapters } from '@/lib/classConfig'
import { useDocTitle } from '@/lib/useDocTitle'

type PageState = 'empty' | 'processing' | 'ready'

const PROCESSING_STEPS = [
  'Extracting table of contents...',
  'Identifying chapter boundaries...',
  'Splitting content by chapter...',
  'Generating chapter summaries...',
]

export default function SubjectChapters() {
  useDocTitle('Chapters')
  const { classId, subjectId } = useParams()
  const navigate = useNavigate()

  const config = getClassConfig(Number(classId) || 1)
  const subject = config.subjects.find(s => getSubjectSlug(s.name) === subjectId)
  const subjectName = subject?.name || subjectId || ''

  const [state, setState] = useState<PageState>('empty')
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [toastShow, setToastShow] = useState(false)

  const chapters = getSubjectChapters(subjectId || '')

  // Processing animation
  useEffect(() => {
    if (state !== 'processing') return
    setProgress(0)
    setCurrentStep(0)

    const totalDuration = 3500
    const interval = 50
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const pct = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(pct)
      setCurrentStep(Math.min(Math.floor((pct / 100) * PROCESSING_STEPS.length), PROCESSING_STEPS.length - 1))

      if (elapsed >= totalDuration) {
        clearInterval(timer)
        setState('ready')
        setToastShow(true)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [state])

  const handleFileSelect = (file: File) => {
    setFileName(file.name)
    setState('processing')
  }

  const handleReUpload = () => {
    setState('empty')
    setFileName('')
  }

  return (
    <div className="space-y-6">
      <Toast
        show={toastShow}
        message="Textbook uploaded successfully"
        description={`${chapters.length} chapters extracted`}
        onClose={() => setToastShow(false)}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <Link to="/admin/classes" className="text-neutral-400 hover:text-primary-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Classes
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <Link to={`/admin/classes/${classId}`} className="text-neutral-400 hover:text-primary-600">Class {classId}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="font-semibold text-neutral-900">{subjectName}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900">Class {classId} — {subjectName}</h1>
        {state === 'empty' && <p className="text-sm text-neutral-500 mt-1">Upload textbook to auto-extract chapters</p>}
        {state === 'ready' && <p className="text-sm text-neutral-500 mt-1">{chapters.length} chapters</p>}
      </div>

      {/* ═══ EMPTY — Upload Zone ═══ */}
      {state === 'empty' && (
        <div className="max-w-lg mx-auto bg-white border border-neutral-300 rounded-2xl p-6">
          <FileUpload
            accept=".pdf"
            label="Upload Textbook PDF"
            description={`Drag & drop or click to choose file`}
            maxSizeLabel="up to 100MB"
            onFileSelect={handleFileSelect}
          />
        </div>
      )}

      {/* ═══ PROCESSING ═══ */}
      {state === 'processing' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Spinner size="sm" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">Processing {fileName}</p>
                <p className="text-xs text-neutral-500">Extracting chapters...</p>
              </div>
            </div>

            <ProgressBar value={progress} gradient className="mb-4" />

            <div className="space-y-2">
              {PROCESSING_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {i < currentStep ? (
                    <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                  ) : i === currentStep ? (
                    <Spinner size="sm" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-neutral-200 rounded-full shrink-0" />
                  )}
                  <span className={`text-xs ${i <= currentStep ? 'text-neutral-700' : 'text-neutral-400'}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ READY — File Info + Chapters ═══ */}
      {state === 'ready' && (
        <>
          {/* Uploaded file bar */}
          <div className="bg-white border border-neutral-200 rounded-xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-info-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-info-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{fileName}</p>
                <p className="text-xs text-neutral-400">12.4 MB • {chapters.length} chapters</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleReUpload} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors">
                <RefreshCw className="w-3 h-3" /> Re-upload
              </button>
              <button onClick={handleReUpload} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger-500 hover:bg-danger-50 rounded-lg transition-colors">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>

          {/* Chapter list */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => navigate(`/admin/classes/${classId}/${subjectId}/${i + 1}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors text-left group"
              >
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-700">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{ch.title}</p>
                  <p className="text-xs text-neutral-400">{ch.pages} pages</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-500 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
