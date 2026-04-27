import { useState } from 'react'
import { BarChart3, BookOpen, TrendingUp, Award, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { PROGRESS_SUBJECTS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

const SUBJECT_PROGRESS = PROGRESS_SUBJECTS

export default function ProgressTracker() {
  useDocTitle('Progress')
  const overallProgress = Math.round(SUBJECT_PROGRESS.reduce((a,s) => a + (s.chaptersDone/s.chaptersTotal)*100, 0) / SUBJECT_PROGRESS.length)
  const overallAvg = Math.round(SUBJECT_PROGRESS.reduce((a,s) => a + s.testsAvg, 0) / SUBJECT_PROGRESS.length)

  return (
    <div className="space-y-8">
      <PageHeader title="Progress Tracker" description="Track your learning progress across all subjects." />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
          <BarChart3 className="w-8 h-8 text-white/70 mb-3" />
          <div className="font-display text-3xl font-bold">{overallProgress}%</div>
          <p className="text-primary-100 text-sm mt-1">Overall Completion</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <TrendingUp className="w-8 h-8 text-success-500 mb-3" />
          <div className="font-display text-3xl font-bold text-neutral-900">{overallAvg}%</div>
          <p className="text-neutral-500 text-sm mt-1">Average Test Score</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <Award className="w-8 h-8 text-accent-500 mb-3" />
          <div className="font-display text-3xl font-bold text-neutral-900">{SUBJECT_PROGRESS.reduce((a,s) => a + s.chaptersDone, 0)}</div>
          <p className="text-neutral-500 text-sm mt-1">Chapters Completed</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold text-neutral-900 mb-6">Subject-wise Progress</h2>
        <div className="space-y-5">
          {SUBJECT_PROGRESS.map((s, i) => {
            const pct = Math.round((s.chaptersDone / s.chaptersTotal) * 100)
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${s.color} rounded-lg flex items-center justify-center`}><BookOpen className="w-4 h-4 text-white" /></div>
                    <div><p className="text-sm font-semibold text-neutral-900">{s.name}</p>
                    <p className="text-xs text-neutral-500">{s.chaptersDone}/{s.chaptersTotal} chapters • Avg: {s.testsAvg}%</p></div>
                  </div>
                  <span className="text-sm font-bold text-neutral-700">{pct}%</span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
