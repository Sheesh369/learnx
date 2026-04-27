// ============================================
// LEARNEXA — CORE TYPE DEFINITIONS
// ============================================

// User Roles
export type UserRole = 'school_admin' | 'teacher' | 'student' | 'parent'

// Board Types
export type BoardType = 'KSEEB' | 'CBSE'

// Content Types
export type ContentType = 'note_pdf' | 'note_text' | 'textbook_pdf' | 'video_upload' | 'video_youtube' | 'gif' | 'image'

// Question Types
export type QuestionType = 'mcq' | 'true_false' | 'fill_blank' | 'short_answer' | 'long_answer' | 'match_following'

// Difficulty Levels
export type Difficulty = 'easy' | 'medium' | 'hard'

// Content Status
export type ContentStatus = 'draft' | 'pending' | 'approved' | 'rejected'

// Test Status
export type TestStatus = 'draft' | 'scheduled' | 'active' | 'completed'

// ============================================
// ENTITY INTERFACES
// ============================================

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatar?: string
  class?: string
  section?: string
  subjects?: string[]
  children?: { name: string; class: string }[]
  createdAt: string
}

export interface SchoolInfo {
  id: string
  name: string
  board: BoardType
  medium: string
  logo?: string
  address?: string
  phone?: string
  email?: string
}

export interface ClassInfo {
  id: string
  standard: number
  sections: Section[]
}

export interface Section {
  id: string
  name: string
  classId: string
  studentCount: number
}

export interface Subject {
  id: string
  name: string
  code: string
  icon?: string
  classId: string
  teacherId?: string
  teacherName?: string
  chapterCount: number
}

export interface Chapter {
  id: string
  number: number
  title: string
  description?: string
  subjectId: string
  contentCount: number
  questionCount: number
  hasContent: boolean
}

export interface Content {
  id: string
  title: string
  type: ContentType
  fileUrl?: string
  contentHtml?: string
  youtubeUrl?: string
  thumbnailUrl?: string
  chapterId: string
  uploadedBy: string
  uploaderName: string
  status: ContentStatus
  size?: number
  duration?: string
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  correctAnswer: string
  explanation?: string
  difficulty: Difficulty
  marks: number
  chapterId: string
  chapterTitle?: string
  subjectName?: string
  createdBy: string
  createdAt: string
}

export interface Test {
  id: string
  title: string
  description?: string
  durationMins: number
  totalMarks: number
  questionCount: number
  classId: string
  subjectId: string
  subjectName?: string
  chapters: string[]
  createdBy: string
  scheduledAt?: string
  status: TestStatus
  createdAt: string
}

export interface TestAttempt {
  id: string
  testId: string
  studentId: string
  studentName: string
  score: number
  totalMarks: number
  percentage: number
  startedAt: string
  submittedAt?: string
  answers: Answer[]
}

export interface Answer {
  questionId: string
  answer: string
  isCorrect?: boolean
  marks: number
  feedback?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
}

// ============================================
// NAV & UI TYPES
// ============================================

export interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

export interface StatCard {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: { value: string; positive: boolean }
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
