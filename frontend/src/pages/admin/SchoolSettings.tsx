import { useState } from 'react'
import { School, Mail, Save } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Input, Select, Button } from '@/components/ui'
import { SUPPORTED_BOARDS } from '@/lib/constants'
import { useDocTitle } from '@/lib/useDocTitle'
import useSettingsStore, { type SchoolSettings } from '@/store/settingsStore'
import useToastStore from '@/store/toastStore'

const BOARD_OPTIONS = SUPPORTED_BOARDS.map(b => ({ value: b.value, label: b.label }))
const MEDIUM_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Hindi',   label: 'Hindi'   },
]

export default function SchoolSettings() {
  useDocTitle('School Settings')

  const { settings, saveSettings } = useSettingsStore()
  const addToast = useToastStore((s) => s.addToast)

  // Local form state — initialised from persisted store on mount
  const [form, setForm] = useState<SchoolSettings>(settings)

  const update = (key: keyof SchoolSettings, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = () => {
    saveSettings(form)
    addToast('Settings saved', { variant: 'success' })
  }

  return (
    <div className="space-y-8">
      <PageHeader title="School Settings" description="Manage your school profile and configuration." />

      <div className="max-w-2xl space-y-6">
        {/* School Profile */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-neutral-900 flex items-center gap-2">
            <School className="w-5 h-5 text-primary-600" /> School Profile
          </h2>

          <Input
            label="School Name"
            value={form.name}
            onChange={(v) => update('name', v)}
            fullWidth
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Board"
              value={form.board}
              onChange={(v) => update('board', v)}
              options={BOARD_OPTIONS}
              fullWidth
            />
            <Select
              label="Medium"
              value={form.medium}
              onChange={(v) => update('medium', v)}
              options={MEDIUM_OPTIONS}
              fullWidth
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
          <h2 className="font-display text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-600" /> Contact Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update('email', v)}
              fullWidth
            />
            <Input
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(v) => update('phone', v)}
              fullWidth
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-colors"
            />
          </div>
        </div>

        <Button icon={<Save className="w-4 h-4" />} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
