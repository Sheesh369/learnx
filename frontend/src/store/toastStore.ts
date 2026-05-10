import { create } from 'zustand'

export interface ToastItem {
  id: string
  message: string
  description?: string
  variant: 'success' | 'error' | 'info'
  duration: number
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (
    message: string,
    opts?: { description?: string; variant?: ToastItem['variant']; duration?: number }
  ) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, opts = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const item: ToastItem = {
      id,
      message,
      description: opts.description,
      variant: opts.variant ?? 'success',
      duration: opts.duration ?? 4000,
    }
    set((s) => ({ toasts: [...s.toasts, item] }))
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export default useToastStore
