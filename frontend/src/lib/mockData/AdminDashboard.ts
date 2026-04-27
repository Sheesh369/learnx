import { BookOpen, Users, Upload, FileText, ClipboardList } from 'lucide-react'
import type { StatCard } from '@/types'

export const ADMIN_STATS: StatCard[] = [
  { label: 'Total Classes', value: '10', icon: BookOpen, color: 'bg-primary-50 text-primary-600' },
  { label: 'Total Teachers', value: '24', icon: Users, color: 'bg-secondary-50 text-secondary-600' },
  { label: 'Total Students', value: '486', icon: Users, color: 'bg-accent-50 text-accent-600' },
  { label: 'Content Uploaded', value: '312', icon: FileText, color: 'bg-purple-50 text-purple-600' },
]

export const ADMIN_ACTIVITY = [
  { user: 'Ramesh Kumar', action: 'uploaded Chapter 5 notes for Class 9 Science', time: '2 hours ago', icon: Upload, iconColor: 'text-primary-600 bg-primary-50' },
  { user: 'Priya Sharma', action: 'created a test for Class 10 Mathematics', time: '4 hours ago', icon: ClipboardList, iconColor: 'text-secondary-600 bg-secondary-50' },
  { user: 'Admin', action: 'added 15 new students to Class 8B', time: '6 hours ago', icon: Users, iconColor: 'text-accent-600 bg-accent-50' },
  { user: 'Deepa Rao', action: 'submitted 20 questions for Biology Chapter 3', time: '1 day ago', icon: FileText, iconColor: 'text-purple-600 bg-purple-50' },
]
