import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import useAuthStore from '@/store/authStore'
import { PARENT_TEST_RESULTS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

const RESULTS = PARENT_TEST_RESULTS

export default function ParentTestResults() {
  useDocTitle('Test Results')
  const { user } = useAuthStore()
  const child = user?.children?.[0]

  return (
    <div className="space-y-8">
      <PageHeader title="Test Results" description={`All test results for ${child?.name || 'your child'}`} />

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-neutral-50 border-b border-neutral-200">
            <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Test</th>
            <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Score</th>
            <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">%</th>
            <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Class Avg</th>
            <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">vs Avg</th>
            <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Rank</th>
            <th className="text-left py-3 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Date</th>
          </tr></thead>
          <tbody>{RESULTS.map(r => {
            const pct = Math.round((r.score / r.total) * 100)
            const diff = pct - r.classAvg
            return (
              <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="py-3.5 px-6">
                  <div className="font-semibold text-neutral-900">{r.subject}</div>
                  <div className="text-xs text-neutral-500">{r.test}</div>
                </td>
                <td className="py-3.5 px-6 font-medium text-neutral-900">{r.score}/{r.total}</td>
                <td className="py-3.5 px-6">
                  <span className={`font-bold ${pct >= 80 ? 'text-success-600' : pct >= 60 ? 'text-accent-600' : 'text-danger-600'}`}>{pct}%</span>
                </td>
                <td className="py-3.5 px-6 text-neutral-500">{r.classAvg}%</td>
                <td className="py-3.5 px-6">
                  <span className={`flex items-center gap-1 text-xs font-medium ${diff >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {diff >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {diff >= 0 ? '+' : ''}{diff}%
                  </span>
                </td>
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-1">
                    {r.rank <= 5 && <Trophy className="w-3.5 h-3.5 text-accent-500" />}
                    <span className="font-medium text-neutral-700">#{r.rank}</span>
                  </div>
                </td>
                <td className="py-3.5 px-6 text-neutral-500 text-xs">{r.date}</td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )
}
