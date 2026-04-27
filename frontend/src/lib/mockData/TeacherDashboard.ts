import { BookOpen, ClipboardList, Upload, Brain } from 'lucide-react'
import type { StatCard } from '@/types'

export const TEACHER_STATS: StatCard[] = [
  { label: 'My Subjects', value: '3', icon: BookOpen, color: 'bg-primary-50 text-primary-600' },
  { label: 'Content Uploaded', value: '47', icon: Upload, color: 'bg-secondary-50 text-secondary-600' },
  { label: 'Questions Created', value: '156', icon: Brain, color: 'bg-accent-50 text-accent-600' },
  { label: 'Tests Created', value: '8', icon: ClipboardList, color: 'bg-purple-50 text-purple-600' },
]

export const TEACHER_SUBJECTS = [
  { name: 'Mathematics', cls: 'Class 9A', chapters: 15, uploaded: 12, color: 'bg-primary-50 border-primary-200' },
  { name: 'Science', cls: 'Class 9A', chapters: 14, uploaded: 8, color: 'bg-secondary-50 border-secondary-200' },
  { name: 'Mathematics', cls: 'Class 10B', chapters: 15, uploaded: 5, color: 'bg-accent-50 border-accent-200' },
]
