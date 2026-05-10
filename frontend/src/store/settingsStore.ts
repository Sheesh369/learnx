import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SchoolSettings {
  name: string
  board: string
  medium: string
  email: string
  phone: string
  address: string
}

interface SettingsState {
  settings: SchoolSettings
  saveSettings: (s: SchoolSettings) => void
}

// Defaults read from env vars so existing .env values are honoured on first load
const DEFAULTS: SchoolSettings = {
  name:    import.meta.env.VITE_SCHOOL_NAME || 'SSB International School',
  board:   'KSEEB',
  medium:  'English',
  email:   'admin@ssb.edu',
  phone:   '+91 80 2345 6789',
  address: '123 Education Lane, Bengaluru, Karnataka 560001',
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      saveSettings: (s) => set({ settings: s }),
    }),
    {
      name: 'learnexa-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useSettingsStore
