import type { StatCard as StatCardType } from '@/types'

export function StatCard({ label, value, icon: Icon, color, trend }: StatCardType) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.positive ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <div className="font-display text-2xl font-bold text-neutral-900 leading-none">{value}</div>
      <p className="text-xs text-neutral-500 mt-1.5 font-medium">{label}</p>
    </div>
  )
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
}
