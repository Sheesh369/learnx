import { useState } from 'react'
import { BookOpen, ChevronRight, FileText, Video, Image } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import CurriculumTree from '@/components/shared/CurriculumTree'
import { STUDENT_CHAPTER_CONTENT } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

const CHAPTER_CONTENT = STUDENT_CHAPTER_CONTENT

export default function StudentSubjects() {
  useDocTitle('My Subjects')
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [chapterInfo, setChapterInfo] = useState<{ title: string; subject: string; class: number } | null>(null)

  const handleSelect = (ch: { id: string; number: number; title: string }, sub: { name: string }, cls: number) => {
    setSelectedChapter(ch.id)
    setChapterInfo({ title: `Ch ${ch.number}: ${ch.title}`, subject: sub.name, class: cls })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Subjects" description="Browse your curriculum and chapter content." />

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 sticky top-24">
            <h3 className="font-display text-sm font-bold text-neutral-700 mb-3 px-2">Curriculum</h3>
            <CurriculumTree onSelectChapter={handleSelect} selectedChapterId={selectedChapter || undefined} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {selectedChapter && chapterInfo ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
                <p className="text-primary-100 text-sm mb-1">Class {chapterInfo.class} • {chapterInfo.subject}</p>
                <h2 className="font-display text-2xl font-bold">{chapterInfo.title}</h2>
              </div>

              {/* Notes */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-600" /> Notes & PDFs</h3>
                <div className="space-y-2">
                  {CHAPTER_CONTENT.notes.map(n => (
                    <div key={n.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-danger-50 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-danger-600" /></div>
                        <div><p className="text-sm font-medium text-neutral-900">{n.title}</p><p className="text-xs text-neutral-500">{n.type} • {n.pages} pages</p></div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-600" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2"><Video className="w-5 h-5 text-primary-600" /> Videos</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CHAPTER_CONTENT.videos.map(v => (
                    <div key={v.id} className="p-4 border border-neutral-200 rounded-xl hover:shadow-sm cursor-pointer transition-shadow">
                      <div className="w-full h-32 bg-neutral-100 rounded-lg mb-3 flex items-center justify-center"><Video className="w-8 h-8 text-neutral-300" /></div>
                      <p className="text-sm font-medium text-neutral-900">{v.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{v.duration} • {v.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images & GIFs */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2"><Image className="w-5 h-5 text-primary-600" /> Images & Diagrams</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CHAPTER_CONTENT.images.map(img => (
                    <div key={img.id} className="p-3 border border-neutral-200 rounded-xl hover:shadow-sm cursor-pointer">
                      <div className="w-full h-24 bg-neutral-100 rounded-lg mb-2 flex items-center justify-center"><Image className="w-6 h-6 text-neutral-300" /></div>
                      <p className="text-xs font-medium text-neutral-700 truncate">{img.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-neutral-900">Select a chapter</h3>
              <p className="text-neutral-500 mt-1">Choose a chapter from the curriculum tree to view content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
