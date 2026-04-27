import { BookOpen, Users, FileText, ClipboardList, Upload, BarChart3, Film, Brain } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard, StatGrid } from '@/components/shared/StatCard'
import { SCHOOL_NAME } from '@/lib/constants'
import type { StatCard as StatCardType } from '@/types'
import { ADMIN_STATS, ADMIN_ACTIVITY } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'





export default function AdminDashboard() {
  useDocTitle('Admin Dashboard')
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description={`Overview of ${SCHOOL_NAME}'s activity and performance.`} />
      <StatGrid>{ADMIN_STATS.map((s, i) => <StatCard key={i} {...s} />)}</StatGrid>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-5">Recent Activity</h2>
          <div className="space-y-4">
            {ADMIN_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                <div className={`w-9 h-9 ${a.iconColor} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-700 leading-relaxed">
                    <span className="font-semibold text-neutral-900">{a.user}</span> {a.action}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Classes', icon: BookOpen, color: 'text-primary-600 bg-primary-50 hover:bg-primary-100', to: '/admin/classes' },
              { label: 'Add Teacher', icon: Users, color: 'text-secondary-600 bg-secondary-50 hover:bg-secondary-100', to: '/admin/teachers' },
              { label: 'Question Bank', icon: Brain, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100', to: '/admin/questions' },
              { label: 'Settings', icon: BookOpen, color: 'text-accent-600 bg-accent-50 hover:bg-accent-100', to: '/admin/settings' },
            ].map((a, i) => (
              <Link key={i} to={a.to} className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border border-neutral-100 ${a.color} transition-colors`}>
                <a.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
