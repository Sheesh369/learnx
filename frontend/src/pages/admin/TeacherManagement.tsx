import { useState } from 'react'
import { Plus, Search, Mail, Phone, BookOpen, MoreVertical } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input, Button, Badge } from '@/components/ui'
import { getInitials } from '@/lib/utils'
import { MOCK_TEACHERS } from '@/lib/mockData'
import { useDocTitle } from '@/lib/useDocTitle'

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subjects: string[]
  classes: string[]
  status: 'active' | 'inactive'
}



export default function TeacherManagement() {
  useDocTitle('Teachers')
  const [teachers] = useState<Teacher[]>(MOCK_TEACHERS)
  const [search, setSearch] = useState('')

  const filtered = teachers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teacher Management"
        description={`${teachers.filter((t) => t.status === 'active').length} active teachers`}
        action={
          <Button icon={<Plus className="w-4 h-4" />}>Add Teacher</Button>
        }
      />

      <div className="max-w-md">
        <Input icon={<Search className="w-4 h-4" />} placeholder="Search teachers..." value={search} onChange={setSearch} fullWidth />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">{getInitials(t.name)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">{t.name}</h3>
                  <Badge color={t.status === 'active' ? 'green' : 'neutral'} size="sm">{t.status}</Badge>
                </div>
              </div>
              <button className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg"><MoreVertical className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-neutral-500">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />{t.email}
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />{t.phone}
              </div>
              <div className="flex items-center gap-2 text-neutral-500">
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                <div className="flex flex-wrap gap-1">
                  {t.subjects.map((s) => <Badge key={s} color="blue" size="sm">{s}</Badge>)}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {t.classes.map((c) => <Badge key={c} size="sm">{c}</Badge>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
