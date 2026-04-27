import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, FileText, Video, Image, Film, Plus, Eye, Trash2 } from 'lucide-react'
import { getClassConfig, getSubjectSlug, getSubjectChapters } from '@/lib/classConfig'
import { MOCK_VIDEOS, MOCK_IMAGES, CHAPTER_TEXTBOOK_CONTENT } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'
import UploadModal from './UploadModal'

type UploadType = 'pdf' | 'video' | 'image' | 'gif'

const UPLOAD_ACTIONS: { type: UploadType; label: string; icon: typeof FileText; cls: string }[] = [
  { type: 'pdf', label: 'PDF', icon: FileText, cls: 'bg-info-50 text-info-600 hover:bg-info-100' },
  { type: 'video', label: 'Video', icon: Video, cls: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { type: 'image', label: 'Image', icon: Image, cls: 'bg-success-50 text-success-600 hover:bg-success-100' },
  { type: 'gif', label: 'GIF', icon: Film, cls: 'bg-accent-50 text-accent-600 hover:bg-accent-100' },
]

export default function ChapterContent() {
  useDocTitle('Chapter Content')
  const { classId, subjectId, chapterId } = useParams()
  const [showUpload, setShowUpload] = useState<UploadType | null>(null)

  const config = getClassConfig(Number(classId) || 1)
  const subject = config.subjects.find(s => getSubjectSlug(s.name) === subjectId)
  const subjectName = subject?.name || subjectId || ''
  const chapterNum = Number(chapterId) || 1
  const chapters = getSubjectChapters(subjectId || '')
  const chapterTitle = chapters[chapterNum - 1]?.title || `Chapter ${chapterId}`
  const content = CHAPTER_TEXTBOOK_CONTENT[subjectId || ''] || CHAPTER_TEXTBOOK_CONTENT.science

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <Link to="/admin/classes" className="text-neutral-400 hover:text-primary-600 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Classes</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <Link to={`/admin/classes/${classId}`} className="text-neutral-400 hover:text-primary-600">Class {classId}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <Link to={`/admin/classes/${classId}/${subjectId}`} className="text-neutral-400 hover:text-primary-600">{subjectName}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
        <span className="font-semibold text-neutral-900">Chapter {chapterId}</span>
      </div>

      {/* Chapter header + upload buttons */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="inline-block text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg mb-2">CHAPTER {chapterId}</span>
          <h1 className="font-display text-2xl font-bold text-neutral-900">{chapterTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          {UPLOAD_ACTIONS.map(a => (
            <button key={a.type} onClick={() => setShowUpload(a.type)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${a.cls}`}>
              <Plus className="w-3.5 h-3.5" /> {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT — Chapter text content (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm px-8 py-8 space-y-8">
            {content.sections.map((section, si) => (
              <div key={si}>
                <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-2">{section.heading}</h2>
                {section.paragraphs.map((p, pi) => (
                  <p key={pi} className="text-sm text-neutral-700 leading-relaxed mb-3" dangerouslySetInnerHTML={{
                    __html: p.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-neutral-900 underline decoration-primary-300 decoration-2 underline-offset-2 cursor-pointer">$1</span>')
                  }} />
                ))}
                {section.formula && (
                  <div className="my-4 px-5 py-3 bg-primary-50 border-l-4 border-primary-500 rounded-r-xl">
                    <code className="text-sm font-mono font-semibold text-primary-800">{section.formula}</code>
                  </div>
                )}
                {si === 0 && (
                  <div className="my-4 text-sm text-neutral-600 space-y-1.5">
                    <p>• All living organisms are composed of one or more cells.</p>
                    <p>• The cell is the basic unit of structure and organisation in organisms.</p>
                    <p>• All cells arise from pre-existing cells.</p>
                  </div>
                )}
              </div>
            ))}

            {/* Attached PDFs */}
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">📄 Attached Notes</h3>
              <div className="space-y-2">
                {['Chapter Notes — Full (2.4 MB)', 'Summary & Key Points (1.1 MB)'].map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-info-500" />
                      <span className="text-sm text-neutral-700">{f}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-neutral-200 rounded-lg"><Eye className="w-3.5 h-3.5 text-neutral-400" /></button>
                      <button className="p-1.5 hover:bg-danger-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-neutral-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Media sidebar (1/3) */}
        <div className="space-y-5">
          {/* Chapter Videos */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-neutral-900">Chapter Videos</h3>
            </div>
            {MOCK_VIDEOS.map(v => (
              <div key={v.id} className="px-4 py-3 border-b border-neutral-100 last:border-0">
                <div className="aspect-video bg-neutral-900 rounded-xl mb-2 flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                  <div className="w-11 h-11 bg-danger-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent ml-1" />
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded font-mono">{v.duration}</span>
                </div>
                <p className="text-xs font-medium text-neutral-800">{v.title}</p>
              </div>
            ))}
          </div>

          {/* Images */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
              <Image className="w-4 h-4 text-success-600" />
              <h3 className="text-sm font-bold text-neutral-900">Images</h3>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_IMAGES.map(img => (
                <div key={img.id} className="relative rounded-xl overflow-hidden border border-neutral-200 group cursor-pointer">
                  <img src={img.src} alt={img.title} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Eye className="w-4 h-4 text-white" /></button>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-black/50 to-transparent text-[10px] text-white font-medium">{img.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GIFs */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
              <Film className="w-4 h-4 text-accent-600" />
              <h3 className="text-sm font-bold text-neutral-900">GIFs</h3>
            </div>
            <div className="px-5 py-6 text-center">
              <Film className="w-7 h-7 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">No GIFs uploaded</p>
            </div>
          </div>
        </div>
      </div>

      <UploadModal
        type={showUpload}
        onClose={() => setShowUpload(null)}
        classId={classId || ''}
        subjectName={subjectName}
        chapterId={chapterId || ''}
        chapterTitle={chapterTitle}
      />
    </div>
  )
}
