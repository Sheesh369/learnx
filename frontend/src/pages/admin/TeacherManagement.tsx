import { useState, useEffect } from 'react'
import { Search, Mail, Phone, Upload, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input, Badge } from '@/components/ui'
import { getInitials } from '@/lib/utils'
import { useDocTitle } from '@/lib/useDocTitle'
import { api } from '@/services/api'
import type { AdminUser } from '@/services/api'
import useActivityStore from '@/store/activityStore'

export default function TeacherManagement() {
  useDocTitle('Teachers')
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.admin.listUsers('teacher')
      .then(setTeachers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    const form = new FormData()
    form.append('file', file)
    try {
      const token = localStorage.getItem('learnexa_token')
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/upload/teachers`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })
      const data = await res.json()
      setUploadMsg(`Created: ${data.created} • Skipped: ${data.skipped}${data.errors?.length ? ` • Errors: ${data.errors.length}` : ''}`)
      useActivityStore.getState().addEntry({
        type: 'teacher_upload',
        title: 'Teachers Uploaded',
        description: `${data.created} added${data.skipped ? ` · ${data.skipped} skipped` : ''}`,
      })
      // Refresh teacher list
      api.admin.listUsers('teacher').then(setTeachers).catch(() => {})
    } catch {
      setUploadMsg('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teacher Management"
        description={`${teachers.filter(t => t.is_active).length} active teachers`}
        action={
          <label className={`flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Excel
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
          </label>
        }
      />

      {uploadMsg && (
        <div className="px-4 py-3 bg-success-50 border border-success-200 text-success-800 text-sm rounded-xl">
          {uploadMsg}
        </div>
      )}

      <div className="max-w-md">
        <Input icon={<Search className="w-4 h-4" />} placeholder="Search teachers..." value={search} onChange={setSearch} fullWidth />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-neutral-400 text-sm">
          {search ? 'No teachers match your search.' : 'No teachers yet. Upload an Excel file to add teachers.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary-600">{getInitials(t.name)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">{t.name}</h3>
                  <Badge color={t.is_active ? 'green' : 'neutral'} size="sm">
                    {t.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{t.email}</span>
                </div>
                {t.phone && (
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    {t.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
