import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Bot, Loader2, FileText, Video, Image, BookOpen } from 'lucide-react'
import { useDocTitle } from '@/lib/useDocTitle'
import { api } from '@/services/api'
import type { Grade, Subject, Chapter, ContentItem } from '@/services/api'

function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]
  if (!videoId) return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm underline">{title || url}</a>
  )
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="w-full aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {title && <p className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50">{title}</p>}
    </div>
  )
}

export default function ChapterContent() {
  useDocTitle('Chapter Content')
  const { classId, subjectId, chapterId } = useParams()

  const [grade, setGrade] = useState<Grade | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!classId || !subjectId || !chapterId) return
    Promise.all([
      api.grades.list(),
      api.grades.listSubjects(classId),
      api.chapters.list(subjectId),
      api.content.listByChapter(chapterId),
    ])
      .then(([grades, subs, chaps, items]) => {
        setGrade(grades.find(g => g.id === classId) ?? null)
        setSubject(subs.find(s => s.id === subjectId) ?? null)
        setChapter(chaps.find(c => c.id === chapterId) ?? null)
        setContents(items.sort((a, b) => a.order_index - b.order_index))
      })
      .catch(() => setError('Failed to load chapter content'))
      .finally(() => setLoading(false))
  }, [classId, subjectId, chapterId])

  const textItems = contents.filter(c => c.content_type === 'simplified_text' || c.content_type === 'note')
  const videoItems = contents.filter(c => c.content_type === 'video_youtube')
  const imageItems = contents.filter(c => c.content_type === 'image')
  const pdfItems = contents.filter(c => c.content_type === 'pdf')

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
        <Link
          to="/admin/ai-processor"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Bot className="w-4 h-4" />
          Process with AI
        </Link>
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
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT — Text content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {textItems.map(item => (
              <div key={item.id} className="bg-white border border-neutral-200 rounded-2xl shadow-sm px-8 py-8">
                {item.title && (
                  <h2 className="text-lg font-bold text-primary-700 mb-4">{item.title}</h2>
                )}
                {item.text_content && (
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{item.text_content}</p>
                )}
                {item.is_ai_generated && (
                  <span className="inline-flex items-center gap-1 mt-4 text-[11px] text-neutral-400">
                    <Bot className="w-3 h-3" /> AI generated
                  </span>
                )}
              </div>
            ))}

            {pdfItems.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-info-500" /> Attached Files
                </h3>
                <div className="space-y-2">
                  {pdfItems.map(item => (
                    <a
                      key={item.id}
                      href={item.gcs_url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-100 hover:bg-neutral-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-info-500 shrink-0" />
                      <span className="text-sm text-neutral-700 truncate">{item.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Media (1/3) */}
          <div className="space-y-5">
            {videoItems.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-neutral-900">Chapter Videos</h3>
                </div>
                <div className="p-4 space-y-4">
                  {videoItems.map(item => (
                    <YouTubeEmbed key={item.id} url={item.youtube_url ?? ''} title={item.title} />
                  ))}
                </div>
              </div>
            )}

            {imageItems.length > 0 && (
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
                  <Image className="w-4 h-4 text-success-600" />
                  <h3 className="text-sm font-bold text-neutral-900">Images</h3>
                </div>
                <div className="p-4 space-y-3">
                  {imageItems.map(item => (
                    <div key={item.id} className="rounded-xl overflow-hidden border border-neutral-200">
                      <img
                        src={item.gcs_url ?? ''}
                        alt={item.title}
                        className="w-full h-auto object-cover"
                      />
                      {item.title && (
                        <p className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50">{item.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
