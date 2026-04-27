import type { User } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface LoginPayload { email: string; password: string }
interface RegisterPayload { name: string; email: string; password: string; role: string; class_name?: string; section?: string }
interface LoginResponse { access_token: string; token_type: string; user: User }

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('learnexa_token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options?.headers } })
  } catch {
    throw new Error('Network error — unable to reach server')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    login: (data: LoginPayload) => apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: RegisterPayload) => apiFetch<LoginResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => apiFetch<User>('/api/auth/me'),
  },
}

export default api
