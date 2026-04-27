import { Bell, Calendar, BookOpen, ClipboardList, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/lib/utils'
import { PARENT_NOTIFICATIONS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

const NOTIFS = PARENT_NOTIFICATIONS

const ICON_MAP = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertTriangle }
const COLOR_MAP = { info: 'bg-primary-50 text-primary-600', success: 'bg-success-50 text-success-600', warning: 'bg-accent-50 text-accent-600', error: 'bg-danger-50 text-danger-600' }

export default function ParentNotifications() {
  useDocTitle('Notifications')
  return (
    <div className="space-y-8">
      <PageHeader title="Notifications" description="Stay updated on your child's activities." />

      <div className="space-y-3 max-w-3xl">
        {NOTIFS.map(n => {
          const Icon = ICON_MAP[n.type]
          return (
            <div key={n.id} className={`bg-white border rounded-2xl p-5 hover:shadow-sm transition-shadow ${n.read ? 'border-neutral-200' : 'border-primary-200 bg-primary-50/30'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${COLOR_MAP[n.type]}`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900 text-sm">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{n.message}</p>
                  <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(n.date)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
