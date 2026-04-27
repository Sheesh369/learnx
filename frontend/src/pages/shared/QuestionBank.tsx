import { useState, useMemo } from 'react'
import { Search, Upload, Shuffle, Eye, EyeOff, Plus, Trash2, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Modal, Toast, Select, Input, Button, Badge, EmptyState } from '@/components/ui'
import { QUESTION_TYPE_LABELS } from '@/lib/constants'
import { MOCK_QUESTIONS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

// ─── Types ───
interface Question {
  id: string
  text: string
  type: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  classId: number
  subject: string
  chapter: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  timeToSolve?: string
}

// ─── Mock Data ───


const DIFF_BADGE: Record<string, 'green' | 'amber' | 'red'> = { easy: 'green', medium: 'amber', hard: 'red' }

const SUBJECT_OPTIONS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Kannada'].map(s => ({ value: s, label: s }))
const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({ value: `Class ${i + 1}`, label: `Class ${i + 1}` }))
const DIFF_OPTIONS = [{ value: 'Easy', label: 'Easy' }, { value: 'Medium', label: 'Medium' }, { value: 'Hard', label: 'Hard' }]
const TYPE_OPTIONS = Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))
const MARKS_OPTIONS = [{ value: '1', label: '1 Mark' }, { value: '2', label: '2 Marks' }, { value: '3', label: '3 Marks' }, { value: '5', label: '5 Marks' }]

export default function QuestionBank() {
  useDocTitle('Question Bank')
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [marksFilter, setMarksFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Toast
  const [toastShow, setToastShow] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadClass, setUploadClass] = useState('')
  const [uploadSubject, setUploadSubject] = useState('')

  const filtered = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) || q.chapter.toLowerCase().includes(search.toLowerCase())
      const matchClass = !classFilter || q.classId === parseInt(classFilter.replace('Class ', ''))
      const matchSubject = !subjectFilter || q.subject === subjectFilter
      const matchDiff = !diffFilter || q.difficulty === diffFilter.toLowerCase()
      const matchType = !typeFilter || q.type === typeFilter
      const matchMarks = !marksFilter || q.marks === parseInt(marksFilter)
      return matchSearch && matchClass && matchSubject && matchDiff && matchType && matchMarks
    })
  }, [questions, search, classFilter, subjectFilter, diffFilter, typeFilter, marksFilter])

  const toast = (msg: string) => { setToastMsg(msg); setToastShow(true) }

  const handleShuffle = () => {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    setQuestions(prev => {
      const ids = new Set(filtered.map(q => q.id))
      return [...shuffled, ...prev.filter(q => !ids.has(q.id))]
    })
    toast('Questions shuffled')
  }

  const handleUploadFile = (file: File) => {
    const classNum = parseInt(uploadClass.replace('Class ', '')) || 9
    toast(`"${file.name}" uploaded for ${uploadClass} — ${uploadSubject}`)
    setShowUploadModal(false)
    const newQ: Question[] = Array.from({ length: 3 }, (_, i) => ({
      id: `new-${Date.now()}-${i}`,
      text: `Imported question ${i + 1} from ${file.name}`,
      type: 'mcq',
      difficulty: (['easy', 'medium', 'hard'] as const)[i % 3],
      marks: [1, 2, 5][i % 3],
      classId: classNum,
      subject: uploadSubject,
      chapter: 'Imported',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      timeToSolve: '00:02:00',
    }))
    setQuestions(prev => [...newQ, ...prev])
  }

  return (
    <div className="space-y-6">
      <Toast show={toastShow} message={toastMsg} onClose={() => setToastShow(false)} />

      {/* Upload Modal */}
      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Question Bank">
        <div className="space-y-4">
          <Select label="Class" value={uploadClass} onChange={setUploadClass} options={CLASS_OPTIONS} placeholder="Select Class" fullWidth />
          <Select label="Subject" value={uploadSubject} onChange={setUploadSubject} options={SUBJECT_OPTIONS} placeholder="Select Subject" fullWidth />
          <p className="text-xs text-neutral-400">Supported: CSV, XLSX, PDF, JSON</p>
          <Button
            variant={uploadClass && uploadSubject ? 'primary' : 'outline'}
            icon={<Upload className="w-4 h-4" />}
            disabled={!uploadClass || !uploadSubject}
            fullWidth
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.csv,.xlsx,.pdf,.json'
              input.onchange = () => {
                const file = input.files?.[0]
                if (file) handleUploadFile(file)
              }
              input.click()
            }}
          >
            Choose File
          </Button>
        </div>
      </Modal>

      {/* Header */}
      <PageHeader
        title="Question Bank"
        description={`${questions.length} total questions`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<Upload className="w-4 h-4" />} onClick={() => { setUploadClass(''); setUploadSubject(''); setShowUploadModal(true) }}>
              Upload Bank
            </Button>
            <Button icon={<Plus className="w-4 h-4" />}>Add Question</Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4">
        <Input icon={<Search className="w-4 h-4" />} placeholder="Search questions, chapters..." value={search} onChange={setSearch} fullWidth className="mb-4" />
        <div className="flex flex-wrap gap-2">
          <Select value={classFilter} onChange={setClassFilter} options={CLASS_OPTIONS} placeholder="All Classes" />
          <Select value={subjectFilter} onChange={setSubjectFilter} options={SUBJECT_OPTIONS} placeholder="All Subjects" />
          <Select value={diffFilter} onChange={setDiffFilter} options={DIFF_OPTIONS} placeholder="All Levels" />
          <Select value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} placeholder="All Types" />
          <Select value={marksFilter} onChange={setMarksFilter} options={MARKS_OPTIONS} placeholder="All Marks" />
          <Button variant="ghost" icon={<Shuffle className="w-3.5 h-3.5" />} onClick={handleShuffle} className="ml-auto">Shuffle</Button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-neutral-500">{filtered.length} question{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Question Cards */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <div key={q.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-neutral-400 mt-1 shrink-0">Q{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    <Badge color={DIFF_BADGE[q.difficulty]} size="md">{q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}</Badge>
                    <Badge size="md">{QUESTION_TYPE_LABELS[q.type] || q.type}</Badge>
                    <Badge color="blue" size="md">{q.marks} Mark{q.marks > 1 ? 's' : ''}</Badge>
                    <span className="text-[11px] text-neutral-400">Class {q.classId} • {q.subject} • {q.chapter}</span>
                  </div>
                  <p className="text-sm text-neutral-900 font-medium leading-relaxed">{q.text}</p>
                  {q.options && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {q.options.map((o, j) => (
                        <div key={j} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${o === q.correctAnswer ? 'bg-success-50 border-success-200 text-success-800 font-semibold' : 'bg-neutral-50 border-neutral-100 text-neutral-600'}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${o === q.correctAnswer ? 'bg-success-200 text-success-800' : 'bg-neutral-200 text-neutral-500'}`}>
                            {String.fromCharCode(65 + j)}
                          </span>
                          {o}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)} className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    {expandedId === q.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            {expandedId === q.id && (
              <div className="px-5 pb-4">
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-primary-700 mb-1.5">Solution</p>
                  <p className="text-sm text-primary-900">{q.correctAnswer}</p>
                  {q.explanation && <p className="text-xs text-primary-600 mt-2">{q.explanation}</p>}
                </div>
              </div>
            )}
            <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[11px] text-neutral-500">
                {q.timeToSolve && <span>Time: {q.timeToSolve}</span>}
                <span>Marks: {q.marks}</span>
                <span>Difficulty: {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}</span>
              </div>
              <button onClick={() => setExpandedId(expandedId === q.id ? null : q.id)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
                {expandedId === q.id ? 'Hide Solution' : 'View Solution'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <EmptyState icon={<Search className="w-10 h-10" />} title="No questions found" description="Try adjusting your filters or search terms" />
        )}
      </div>
    </div>
  )
}
