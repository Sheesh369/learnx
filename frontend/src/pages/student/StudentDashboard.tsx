import { BookOpen, ClipboardList, BarChart3, BookMarked, Clock, ChevronRight, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard, StatGrid } from '@/components/shared/StatCard'
import useAuthStore from '@/store/authStore'
import type { StatCard as StatCardType } from '@/types'
import { STUDENT_SUBJECTS, STUDENT_UPCOMING_TESTS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'





export default function StudentDashboard() {
  useDocTitle('Student Dashboard')
  const { user } = useAuthStore()

  const stats: StatCardType[] = [
    { label: 'Subjects', value: '5', icon: BookOpen, color: 'bg-primary-50 text-primary-600' },
    { label: 'Upcoming Tests', value: '2', icon: ClipboardList, color: 'bg-danger-50 text-danger-600' },
    { label: 'Overall Progress', value: '54%', icon: TrendingUp, color: 'bg-secondary-50 text-secondary-600' },
    { label: 'Bookmarks', value: '12', icon: BookMarked, color: 'bg-accent-50 text-accent-600' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`} description={`Class ${user?.class}${user?.section} • Karnataka State Board`} />
      <StatGrid>{stats.map((s, i) => <StatCard key={i} {...s} />)}</StatGrid>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-4">My Subjects</h2>
          <div className="space-y-3">
            {STUDENT_SUBJECTS.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors group">
                <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-neutral-900">{s.name}</h3>
                    <span className="text-xs text-neutral-500">{s.completed}/{s.chapters}</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: `${(s.completed / s.chapters) * 100}%` }} />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-4">Upcoming Tests</h2>
          <div className="space-y-3">
            {STUDENT_UPCOMING_TESTS.map((t, i) => (
              <div key={i} className="p-4 bg-danger-50 border border-danger-100 rounded-xl">
                <h3 className="font-semibold text-sm text-neutral-900">{t.subject}</h3>
                <p className="text-xs text-neutral-600 mt-1">{t.chapter}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.duration}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
