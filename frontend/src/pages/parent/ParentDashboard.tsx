import { Trophy, BookOpen, TrendingUp, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard, StatGrid } from '@/components/shared/StatCard'
import useAuthStore from '@/store/authStore'
import { SCHOOL_NAME } from '@/lib/constants'
import { getInitials } from '@/lib/utils'
import type { StatCard as StatCardType } from '@/types'
import { PARENT_DASHBOARD_RESULTS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

const RESULTS = PARENT_DASHBOARD_RESULTS

export default function ParentDashboard() {
  useDocTitle('Parent Dashboard')
  const { user } = useAuthStore()
  const child = user?.children?.[0]

  const stats: StatCardType[] = [
    { label: 'Overall Score', value: '78%', icon: Trophy, color: 'bg-accent-50 text-accent-600' },
    { label: 'Tests Taken', value: '12', icon: BookOpen, color: 'bg-primary-50 text-primary-600' },
    { label: 'Improvement', value: '+5%', icon: TrendingUp, color: 'bg-success-50 text-success-600' },
    { label: 'Pending Tests', value: '2', icon: Clock, color: 'bg-danger-50 text-danger-600' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader title="Parent Dashboard" description="Track your child's academic progress and performance." />

      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="font-display text-xl font-bold">{child ? getInitials(child.name) : 'ST'}</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">{child?.name || 'Student'}</h2>
            <p className="text-primary-100">Class {child?.class || '9A'} • Karnataka State Board • {SCHOOL_NAME}</p>
          </div>
        </div>
      </div>

      <StatGrid>{stats.map((s, i) => <StatCard key={i} {...s} />)}</StatGrid>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-neutral-900 mb-4">Recent Test Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Subject</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Test</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Score</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Class Avg</th>
                <th className="text-left py-3 px-4 text-neutral-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {RESULTS.map((r, i) => (
                <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4 font-medium text-neutral-900">{r.subject}</td>
                  <td className="py-3 px-4 text-neutral-600">{r.test}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${r.score >= 80 ? 'text-success-600' : r.score >= 60 ? 'text-accent-600' : 'text-danger-600'}`}>{r.score}%</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-500">{r.avg}%</td>
                  <td className="py-3 px-4 text-neutral-500">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
