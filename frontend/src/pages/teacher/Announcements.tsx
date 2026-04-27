import { useState } from 'react'
import { Plus, Send, Trash2, Bell, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/lib/utils'
import { Input, Select, Button, Badge } from '@/components/ui'
import { MOCK_ANNOUNCEMENTS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

export default function Announcements() {
  useDocTitle('Announcements')
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMsg, setNewMsg] = useState('')
  const [newClass, setNewClass] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setAnnouncements([{ id: Date.now().toString(), title: newTitle, message: newMsg, class: newClass, date: new Date().toISOString() }, ...announcements])
    setNewTitle(''); setNewMsg(''); setNewClass(''); setShowForm(false)
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Announcements" description={`${announcements.length} announcements`}
        action={<Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>New Announcement</Button>} />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 max-w-2xl">
          <Input required value={newTitle} onChange={setNewTitle} placeholder="Announcement title..." fullWidth />
          <textarea required value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Message..." rows={3} className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none" />
          <div className="flex gap-3">
            <Select
              required
              value={newClass}
              onChange={setNewClass}
              options={[
                { value: '', label: 'Target class', disabled: true },
                { value: 'All', label: 'All' },
                { value: '9A', label: '9A' },
                { value: '9B', label: '9B' },
                { value: '10A', label: '10A' },
                { value: '10B', label: '10B' }
              ]}
            />
            <Button type="submit" icon={<Send className="w-4 h-4" />}>Post</Button>
            <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><Bell className="w-5 h-5 text-primary-600" /></div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{a.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{a.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                    <Badge color="neutral" size="sm">Class: {a.class}</Badge>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(a.date)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setAnnouncements(announcements.filter(x => x.id !== a.id))} className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
