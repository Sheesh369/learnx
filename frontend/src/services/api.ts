import type { User } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface LoginPayload { email: string; password: string }
interface LoginResponse { access_token: string; token_type: string; user: User }

export interface Grade { id: string; standard: number; board: string }
export interface Subject { id: string; name: string; code: string; grade_id: string }
export interface Chapter { id: string; number: number; title: string; description?: string; subject_id: string }

export type ContentType = 'simplified_text' | 'image' | 'video_youtube' | 'pdf' | 'note'
export interface ContentItem {
  id: string
  chapter_id: string
  content_type: ContentType
  title: string
  order_index: number
  text_content: string | null
  gcs_url: string | null
  youtube_url: string | null
  is_ai_generated: boolean
  created_at: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  class_name: string | null
  section: string | null
  is_active: boolean
}

export interface GlossaryEntry {
  id: string
  word: string
  definition: string
  synonym: string | null
  chapter_id: string | null
  subject_id: string | null
  is_ai_generated: boolean
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('learnexa_token')
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  // Only set Content-Type for JSON (not FormData)
  if (!options?.body || typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json'
  }

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
    me: () => apiFetch<User>('/api/auth/me'),
  },
  grades: {
    list: () => apiFetch<Grade[]>('/api/admin/grades'),
    create: (data: { standard: number; board: string }) =>
      apiFetch<Grade>('/api/admin/grades', { method: 'POST', body: JSON.stringify(data) }),
    listSubjects: (gradeId: string) => apiFetch<Subject[]>(`/api/admin/grades/${gradeId}/subjects`),
    createSubject: (gradeId: string, data: { name: string; code: string }) =>
      apiFetch<Subject>(`/api/admin/grades/${gradeId}/subjects`, { method: 'POST', body: JSON.stringify(data) }),
  },
  chapters: {
    list: (subjectId: string) => apiFetch<Chapter[]>(`/api/admin/chapters/subject/${subjectId}`),
    create: (data: { number: number; title: string; description?: string; subject_id: string }) =>
      apiFetch<Chapter>('/api/admin/chapters', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    listUsers: (role?: string) =>
      apiFetch<AdminUser[]>(`/api/admin/users${role ? `?role=${role}` : ''}`),
  },
  content: {
    listByChapter: (chapterId: string) =>
      apiFetch<ContentItem[]>(`/api/content/chapter/${chapterId}`),
  },
  books: {
    uploadPdf: (chapterId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return apiFetch<{ message: string; gcs_url: string }>(
        `/api/admin/books/upload/${chapterId}`,
        { method: 'POST', body: form }
      )
    },
    process: (chapterId: string) =>
      apiFetch<{ chapter_id: string; status: string; message: string }>(
        `/api/admin/books/${chapterId}/process`,
        { method: 'POST' }
      ),
    getStatus: (chapterId: string) =>
      apiFetch<{ chapter_id: string; has_content: boolean; content_count: number }>(
        `/api/admin/books/${chapterId}/status`,
        { method: 'GET' }
      ),
  },
  glossary: {
    listByChapter: (chapterId: string) =>
      apiFetch<GlossaryEntry[]>(`/api/glossary/chapter/${chapterId}`),
  },
}

export default api
