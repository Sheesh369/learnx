import { BookOpen, TrendingUp, Award, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import useAuthStore from '@/store/authStore'
import { SCHOOL_NAME } from '@/lib/constants'
import { CHILD_SUBJECTS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'



export default function ChildProgress() {
  useDocTitle('Child Progress')
  const { user } = useAuthStore()
  const child = user?.children?.[0]

  return (
    <div className="space-y-8">
      <PageHeader title="Child Progress" description={`Detailed progress for ${child?.name || 'your child'}`} />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
          <BarChart3 className="w-6 h-6 text-white/70 mb-2" />
          <div className="font-display text-3xl font-bold">{Math.round(CHILD_SUBJECTS.reduce((a,s) => a + (s.completed/s.total)*100, 0) / CHILD_SUBJECTS.length)}%</div>
          <p className="text-primary-100 text-sm mt-1">Overall Completion</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <Award className="w-6 h-6 text-accent-500 mb-2" />
          <div className="font-display text-3xl font-bold text-neutral-900">{Math.round(CHILD_SUBJECTS.reduce((a,s) => a + s.avgScore, 0) / CHILD_SUBJECTS.length)}%</div>
          <p className="text-neutral-500 text-sm mt-1">Average Score</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <TrendingUp className="w-6 h-6 text-success-500 mb-2" />
          <div className="font-display text-3xl font-bold text-neutral-900">{CHILD_SUBJECTS.reduce((a,s) => a + s.completed, 0)}</div>
          <p className="text-neutral-500 text-sm mt-1">Chapters Completed</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-neutral-900 mb-6">Subject-wise Breakdown</h2>
        <div className="space-y-5">
          {CHILD_SUBJECTS.map((s, i) => {
            const pct = Math.round((s.completed / s.total) * 100)
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center`}><BookOpen className="w-4 h-4 text-white" /></div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{s.name}</p>
                      <p className="text-xs text-neutral-500">{s.completed}/{s.total} chapters • Avg: {s.avgScore}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-700">{pct}%</span>
                    <span className={`block text-xs font-medium ${s.trend.startsWith('+') ? 'text-success-600' : 'text-danger-600'}`}>{s.trend}</span>
                  </div>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
