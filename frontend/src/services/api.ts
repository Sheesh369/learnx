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

export interface QuestionOut {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  difficulty: 'easy' | 'medium' | 'hard'
  chapter_id: string
  chapter_title: string | null
  subject_name: string | null
  grade_standard: number | null
  created_at: string
  is_ai_generated: boolean
}

export interface QuestionCreate {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  difficulty: 'easy' | 'medium' | 'hard'
  chapter_id: string
}

export interface ExcelUploadResult {
  imported: number
  skipped: number
  errors: { row: number; reason: string }[]
}

export interface ChapterStatus {
  chapter_id: string
  has_content: boolean
  content_count: number
  is_processing: boolean
  has_questions: boolean
  question_count: number
  is_generating_questions: boolean
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
  if (res.status === 204) return undefined as T
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
    update: (gradeId: string, data: { board: string }) =>
      apiFetch<Grade>(`/api/admin/grades/${gradeId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (gradeId: string) =>
      apiFetch<void>(`/api/admin/grades/${gradeId}`, { method: 'DELETE' }),
    listSubjects: (gradeId: string) => apiFetch<Subject[]>(`/api/admin/grades/${gradeId}/subjects`),
    createSubject: (gradeId: string, data: { name: string; code: string }) =>
      apiFetch<Subject>(`/api/admin/grades/${gradeId}/subjects`, { method: 'POST', body: JSON.stringify(data) }),
    updateSubject: (gradeId: string, subjectId: string, data: { name: string; code: string }) =>
      apiFetch<Subject>(`/api/admin/grades/${gradeId}/subjects/${subjectId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSubject: (gradeId: string, subjectId: string) =>
      apiFetch<void>(`/api/admin/grades/${gradeId}/subjects/${subjectId}`, { method: 'DELETE' }),
  },
  chapters: {
    list: (subjectId: string) => apiFetch<Chapter[]>(`/api/admin/chapters/subject/${subjectId}`),
    create: (data: { number: number; title: string; description?: string; subject_id: string }) =>
      apiFetch<Chapter>('/api/admin/chapters', { method: 'POST', body: JSON.stringify(data) }),
    update: (chapterId: string, data: { title: string; description?: string }) =>
      apiFetch<Chapter>(`/api/admin/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (chapterId: string) =>
      apiFetch<void>(`/api/admin/chapters/${chapterId}`, { method: 'DELETE' }),
    reorder: (subjectId: string, items: { id: string; number: number }[]) =>
      apiFetch<Chapter[]>(`/api/admin/chapters/subject/${subjectId}/reorder`, { method: 'PATCH', body: JSON.stringify(items) }),
  },
  admin: {
    listUsers: (role?: string) =>
      apiFetch<AdminUser[]>(`/api/admin/users${role ? `?role=${role}` : ''}`),
  },
  content: {
    listByChapter: (chapterId: string) =>
      apiFetch<ContentItem[]>(`/api/content/chapter/${chapterId}`),
    update: (id: string, data: { title?: string; text_content?: string; youtube_url?: string }) =>
      apiFetch<ContentItem>(`/api/content/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/content/${id}`, { method: 'DELETE' }),
    bulkReorder: (chapterId: string, items: { id: string; order_index: number }[]) =>
      apiFetch<void>(`/api/content/chapter/${chapterId}/reorder-bulk`, {
        method: 'PATCH',
        body: JSON.stringify(items),
      }),
    stats: () =>
      apiFetch<{ chapters_with_content: number }>('/api/content/stats'),
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
      apiFetch<ChapterStatus>(`/api/admin/books/${chapterId}/status`, { method: 'GET' }),
    cancelProcess: (chapterId: string) =>
      apiFetch<{ chapter_id: string; status: string }>(
        `/api/admin/books/${chapterId}/process`,
        { method: 'DELETE' }
      ),
  },
  glossary: {
    listByChapter: (chapterId: string) =>
      apiFetch<GlossaryEntry[]>(`/api/glossary/chapter/${chapterId}`),
  },
  questions: {
    list: (params?: { chapter_id?: string; subject_id?: string; grade_id?: string }) => {
      const q = new URLSearchParams()
      if (params?.chapter_id) q.append('chapter_id', params.chapter_id)
      if (params?.subject_id) q.append('subject_id', params.subject_id)
      if (params?.grade_id) q.append('grade_id', params.grade_id)
      return apiFetch<QuestionOut[]>(`/api/questions/?${q}`)
    },
    create: (data: QuestionCreate) =>
      apiFetch<QuestionOut>('/api/questions/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: QuestionCreate) =>
      apiFetch<QuestionOut>(`/api/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiFetch<{ message: string }>(`/api/questions/${id}`, { method: 'DELETE' }),
    generate: (chapterId: string) =>
      apiFetch<{ chapter_id: string; status: string }>(
        `/api/questions/generate/${chapterId}`,
        { method: 'POST' }
      ),
    uploadExcel: (chapterId: string, file: File) => {
      const form = new FormData()
      form.append('file', file)
      return apiFetch<ExcelUploadResult>(`/api/questions/upload/${chapterId}`, { method: 'POST', body: form })
    },
    downloadTemplate: async () => {
      const token = localStorage.getItem('learnexa_token')
      const res = await fetch(`${API_BASE}/api/questions/template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Failed to download template')
      return res.blob()
    },
  },
}

export default api
