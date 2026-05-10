import { create } from 'zustand'
import type { User, UserRole } from '@/types'
import { DASHBOARD_PATHS } from '@/lib/constants'
import api from '@/services/api'
import useProcessingStore from './processingStore'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  clearError: () => void
  getDashboardPath: () => string
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('learnexa_token'),
  isAuthenticated: !!localStorage.getItem('learnexa_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.auth.login({ email, password })
      localStorage.setItem('learnexa_token', res.access_token)
      set({ user: res.user, token: res.access_token, isAuthenticated: true, isLoading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ isLoading: false, error: message })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('learnexa_token')
    useProcessingStore.getState().clearAll()
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadUser: async () => {
    const token = localStorage.getItem('learnexa_token')
    if (!token) return
    set({ isLoading: true })
    try {
      const user = await api.auth.me()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('learnexa_token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),

  getDashboardPath: () => {
    const { user } = get()
    return user ? (DASHBOARD_PATHS[user.role] || '/login') : '/login'
  },
}))

export default useAuthStore
