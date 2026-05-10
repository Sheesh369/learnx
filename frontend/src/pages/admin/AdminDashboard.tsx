import { useEffect, useState } from 'react'
import {
  BookOpen, Users, FileText, BarChart3, Brain,
  Loader2, CheckCircle2, AlertCircle, RotateCcw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard, StatGrid } from '@/components/shared/StatCard'
import { useDocTitle } from '@/lib/useDocTitle'
import useActivityStore, { type ActivityEntry } from '@/store/activityStore'
import useProcessingStore from '@/store/processingStore'
import useToastStore from '@/store/toastStore'
import useSettingsStore from '@/store/settingsStore'
import { api } from '@/services/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const d = Date.now() - ts
  if (d < 60_000) return 'Just now'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  return `${Math.floor(d / 86_400_000)}d ago`
}

function entryIcon(entry: ActivityEntry, effectiveStatus?: string) {
  if (entry.type === 'ai_generation') {
    if (effectiveStatus === 'in_progress')
      return { Icon: Loader2,      spin: true,  cls: 'text-amber-600 bg-amber-50' }
    if (effectiveStatus === 'done')
      return { Icon: CheckCircle2, spin: false, cls: 'text-success-600 bg-success-50' }
    return   { Icon: AlertCircle,  spin: false, cls: 'text-danger-600 bg-danger-50' }
  }
  if (entry.type === 'grade_created')   return { Icon: BookOpen,  spin: false, cls: 'text-primary-600 bg-primary-50' }
  if (entry.type === 'subject_created') return { Icon: BookOpen,  spin: false, cls: 'text-secondary-600 bg-secondary-50' }
  if (entry.type === 'chapter_created') return { Icon: FileText,  spin: false, cls: 'text-info-600 bg-info-50' }
  if (entry.type === 'teacher_upload')  return { Icon: Users,     spin: false, cls: 'text-purple-600 bg-purple-50' }
  return                                       { Icon: BarChart3, spin: false, cls: 'text-neutral-500 bg-neutral-100' }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  useDocTitle('Admin Dashboard')

  const schoolName = useSettingsStore((s) => s.settings.name)
  const entries    = useActivityStore((s) => s.entries)
  const processing = useProcessingStore((s) => s.chapters)
  const addToast   = useToastStore((s) => s.addToast)

  // Real stat counts fetched from API
  const [counts, setCounts] = useState({ grades: 0, teachers: 0, students: 0, content: 0, loading: true })

  useEffect(() => {
    Promise.all([
      api.grades.list(),
      api.admin.listUsers('teacher'),
      api.admin.listUsers('student'),
      api.content.stats(),
    ])
      .then(([grades, teachers, students, contentStats]) => {
        setCounts({
          grades:   grades.length,
          teachers: teachers.length,
          students: students.length,
          content:  contentStats.chapters_with_content,
          loading:  false,
        })
      })
      .catch(() => setCounts((s) => ({ ...s, loading: false })))
  }, [])

  // Reconcile stale in_progress entries after a page refresh.
  // processingStore uses sessionStorage (cleared on tab close); activityStore uses
  // localStorage (persists). On mount, check the real status for any entry that
  // claims in_progress but has no live processingStore record.
  useEffect(() => {
    const stale = useActivityStore.getState().entries.filter(
      (e) =>
        e.type === 'ai_generation' &&
        e.status === 'in_progress' &&
        e.chapterId &&
        !useProcessingStore.getState().chapters[e.chapterId]
    )
    stale.forEach(async (entry) => {
      try {
        const s = await api.books.getStatus(entry.chapterId!)
        const done    = s.has_content && s.has_questions && !s.is_processing && !s.is_generating_questions
        const failed  = s.has_content && !s.has_questions && !s.is_processing && !s.is_generating_questions
        const running = s.is_processing || s.is_generating_questions
        if (done) {
          useActivityStore.getState().updateEntry(entry.id, { status: 'done' })
        } else if (failed) {
          useActivityStore.getState().updateEntry(entry.id, { status: 'error' })
        } else if (running) {
          // Still running — re-add to processingStore so ProcessingManager resumes polling
          useProcessingStore.getState().addChapter({
            chapterId:    entry.chapterId!,
            chapterTitle: entry.chapterTitle ?? '',
            subjectName:  entry.subjectName  ?? '',
            gradeName:    entry.gradeName    ?? '',
          })
        } else {
          useActivityStore.getState().updateEntry(entry.id, { status: 'error' })
        }
      } catch { /* server unreachable — leave as-is */ }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancel an active generation ───────────────────────────────────────────
  async function handleCancel(entry: ActivityEntry) {
    try { await api.books.cancelProcess(entry.chapterId!) } catch { /* 409 = already done */ }
    useProcessingStore.getState().removeChapter(entry.chapterId!)
    useActivityStore.getState().updateEntry(entry.id, { status: 'error' })
    addToast('Processing cancelled', { variant: 'info' })
  }

  // ── Retry failed question generation ─────────────────────────────────────
  async function handleRetry(entry: ActivityEntry) {
    try {
      await api.questions.generate(entry.chapterId!)
      const { chapters, addChapter, updateStatus } = useProcessingStore.getState()
      if (!chapters[entry.chapterId!]) {
        addChapter({
          chapterId:    entry.chapterId!,
          chapterTitle: entry.chapterTitle ?? '',
          subjectName:  entry.subjectName  ?? '',
          gradeName:    entry.gradeName    ?? '',
        })
      }
      updateStatus(entry.chapterId!, 'questions_generating')
      useActivityStore.getState().updateEntry(entry.id, { status: 'in_progress' })
      addToast('Regenerating questions...', { variant: 'info' })
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to retry', { variant: 'error' })
    }
  }

  // Show 10 most recent entries (store holds up to 50)
  const recent = [...entries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description={`Overview of ${schoolName}'s activity and performance.`}
      />

      <StatGrid>
        {[
          { label: 'Total Classes',  value: counts.loading ? '…' : String(counts.grades),   icon: BookOpen, color: 'bg-primary-50 text-primary-600' },
          { label: 'Total Teachers', value: counts.loading ? '…' : String(counts.teachers), icon: Users,    color: 'bg-secondary-50 text-secondary-600' },
          { label: 'Total Students', value: counts.loading ? '…' : String(counts.students), icon: Users,    color: 'bg-accent-50 text-accent-600' },
          { label: 'Chapters with Content', value: counts.loading ? '…' : String(counts.content), icon: FileText, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => <StatCard key={i} {...s} />)}
      </StatGrid>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-5">Recent Activity</h2>

          {recent.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              Activity will appear here as you use the platform.
            </p>
          ) : (
            /* Scrollable list — capped height so Quick Actions section is never pushed down */
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {recent.map((entry) => {
                // Resolve live status from processingStore first; fall back to stored status
                const live = entry.chapterId ? processing[entry.chapterId] : undefined
                const effectiveStatus = live
                  ? (live.status === 'done' || live.status === 'error' ? live.status : 'in_progress')
                  : entry.status

                const { Icon, spin, cls } = entryIcon(entry, effectiveStatus)

                // Cancel: only when chapter is actively tracked in processingStore
                const canCancel =
                  entry.type === 'ai_generation' &&
                  effectiveStatus === 'in_progress' &&
                  !!live

                // Retry: when questions failed and chapterId is available
                const canRetry =
                  entry.type === 'ai_generation' &&
                  effectiveStatus === 'error' &&
                  !!entry.chapterId

                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cls}`}>
                      <Icon className={`w-4 h-4 ${spin ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">{entry.title}</p>
                      <p className="text-xs text-neutral-500 truncate">{entry.description}</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{timeAgo(entry.timestamp)}</p>
                      {(canCancel || canRetry) && (
                        <div className="flex items-center gap-3 mt-1.5">
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(entry)}
                              className="text-[11px] font-semibold text-neutral-500 hover:text-danger-600 underline"
                            >
                              Cancel
                            </button>
                          )}
                          {canRetry && (
                            <button
                              onClick={() => handleRetry(entry)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 underline"
                            >
                              <RotateCcw className="w-3 h-3" /> Retry
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold text-neutral-900 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Classes',  icon: BookOpen,  color: 'text-primary-600 bg-primary-50 hover:bg-primary-100',   to: '/admin/classes' },
              { label: 'Add Teacher',     icon: Users,     color: 'text-secondary-600 bg-secondary-50 hover:bg-secondary-100', to: '/admin/teachers' },
              { label: 'Question Bank',   icon: Brain,     color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',       to: '/admin/questions' },
              { label: 'Settings',        icon: BookOpen,  color: 'text-accent-600 bg-accent-50 hover:bg-accent-100',       to: '/admin/settings' },
            ].map((a, i) => (
              <Link
                key={i}
                to={a.to}
                className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl border border-neutral-100 ${a.color} transition-colors`}
              >
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
