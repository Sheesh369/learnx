// ============================================
// LEARNEXA — APP CONSTANTS
// Single school: SSB International School
// ============================================

import type { BoardType } from '@/types'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Learnexa'
export const SCHOOL_NAME = import.meta.env.VITE_SCHOOL_NAME || 'SSB International School'

export const SUPPORTED_BOARDS: { value: BoardType; label: string }[] = [
  { value: 'KSEEB', label: 'Karnataka State Board (KSEEB)' },
  { value: 'CBSE', label: 'CBSE Board' },
]

export const CLASSES = Array.from({ length: 10 }, (_, i) => ({
  standard: i + 1,
  label: `Class ${i + 1}`,
}))

// Subject templates by board
export const SUBJECT_TEMPLATES: Record<BoardType, Record<string, string[]>> = {
  KSEEB: {
    'Class 1-4': ['Kannada', 'English', 'Mathematics', 'EVS'],
    'Class 5-7': ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
    'Class 8-10': ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  },
  CBSE: {
    'Class 1-5': ['English', 'Hindi', 'Mathematics', 'EVS'],
    'Class 6-8': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
    'Class 9-10': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  },
}

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer',
  match_following: 'Match the Following',
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  note_pdf: 'PDF Notes',
  note_text: 'Text Notes',
  textbook_pdf: 'Textbook PDF',
  video_upload: 'Video Upload',
  video_youtube: 'YouTube Video',
  gif: 'GIF',
  image: 'Image',
}

export const ACCEPTED_FILE_TYPES = {
  pdf: '.pdf',
  video: '.mp4,.webm,.mov',
  image: '.jpg,.jpeg,.png,.webp',
  gif: '.gif',
  document: '.pdf,.doc,.docx',
}

export const MAX_FILE_SIZES = {
  pdf: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  image: 10 * 1024 * 1024, // 10MB
  gif: 20 * 1024 * 1024, // 20MB
}

export const DASHBOARD_PATHS: Record<string, string> = {
  school_admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
}
