import { BookOpen, Upload, Brain, ClipboardList, FileText } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard, StatGrid } from '@/components/shared/StatCard'
import type { StatCard as StatCardType } from '@/types'
import { TEACHER_STATS, TEACHER_SUBJECTS, TEACHER_UPLOADS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

const UPLOADS = TEACHER_UPLOADS

export default function TeacherDashboard() {
  useDocTitle('Teacher Dashboard')
  return (
    <div className="space-y-8">
      <PageHeader title="Teacher Dashboard" description="Manage your subjects, content, and assessments." />
      <StatGrid>{TEACHER_STATS.map((s, i) => <StatCard key={i} {...s} />)}</StatGrid>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-4">My Subjects</h2>
          <div className="space-y-3">
            {TEACHER_SUBJECTS.map((s, i) => (
              <div key={i} className={`p-4 rounded-xl border ${s.color} hover:shadow-sm transition-shadow cursor-pointer`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900">{s.name}</h3>
                  <span className="text-xs font-medium text-neutral-500 bg-white px-2 py-1 rounded-md">{s.cls}</span>
                </div>
                <p className="text-sm text-neutral-600 mb-2">{s.uploaded}/{s.chapters} chapters covered</p>
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(s.uploaded / s.chapters) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-4">Recent Uploads</h2>
          <div className="space-y-4">
            {UPLOADS.map((u, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-neutral-500" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">{u.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{u.subject} • {u.cls} • {u.time}</p>
                </div>
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-md">{u.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
