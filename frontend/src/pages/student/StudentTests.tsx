import { Clock, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { getStatusColor } from '@/lib/utils'
import { STUDENT_TESTS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'



export default function StudentTests() {
  useDocTitle('Tests')
  return (
    <div className="space-y-8">
      <PageHeader title="My Tests" description="View your upcoming and completed tests." />

      <div className="space-y-4">
        {STUDENT_TESTS.map(t => (
          <div key={t.id} className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${t.status === 'completed' ? 'bg-success-50' : t.status === 'active' ? 'bg-danger-50' : 'bg-neutral-100'}`}>
              {t.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-success-600" /> : t.status === 'active' ? <AlertCircle className="w-6 h-6 text-danger-600" /> : <Clock className="w-6 h-6 text-neutral-400" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900">{t.title}</h3>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-neutral-500">
                <span>{t.subject}</span><span>•</span>
                <span>{t.questions} questions</span><span>•</span>
                <span>{t.duration} min</span><span>•</span>
                <span>{t.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {t.status === 'completed' && (
                <div className="text-right">
                  <div className="font-display text-xl font-bold text-success-600">{t.score}/{t.total}</div>
                  <p className="text-xs text-neutral-500">{Math.round((t.score/t.total)*100)}%</p>
                </div>
              )}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg capitalize ${getStatusColor(t.status)}`}>{t.status}</span>
              {t.status === 'active' && (
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl">Start Test</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
