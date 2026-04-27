import { BookOpen, Brain, Video, BarChart3, ClipboardList, Users, Shield, PenTool, Heart } from 'lucide-react'

export const LANDING_FEATURES = [
  { icon: BookOpen, title: 'Chapter-Wise Content', desc: 'Notes, textbooks, and study material organized by class, subject, and chapter.', color: 'from-primary-500 to-primary-600' },
  { icon: Brain, title: 'Smart Question Bank', desc: 'Create, tag, and organize questions by difficulty. Auto-generate balanced test papers.', color: 'from-secondary-500 to-secondary-600' },
  { icon: Video, title: 'Rich Media Support', desc: 'Upload PDFs, videos, GIFs, images, or embed YouTube links for every chapter.', color: 'from-accent-500 to-accent-600' },
  { icon: ClipboardList, title: 'Assessments & Grading', desc: 'Timed tests with auto-grading for MCQs and manual grading for subjective answers.', color: 'from-purple-500 to-purple-600' },
  { icon: BarChart3, title: 'Actionable Analytics', desc: 'Track student progress chapter-wise. Identify weak areas with data-driven insights.', color: 'from-pink-500 to-pink-600' },
  { icon: Users, title: 'Parent Transparency', desc: "Parents see their child's progress, test results, and assignments in real-time.", color: 'from-orange-500 to-orange-600' },
]

export const LANDING_STEPS = [
  { n: '01', title: 'Admin Sets Up', desc: 'Configure classes, subjects, and assign teachers.', icon: Shield },
  { n: '02', title: 'Teachers Upload', desc: 'Add chapter-wise notes, videos, and build question banks.', icon: PenTool },
  { n: '03', title: 'Students Learn', desc: 'Access organized content and take tests at their pace.', icon: BookOpen },
  { n: '04', title: 'Parents Monitor', desc: 'View test results and get performance notifications.', icon: Heart },
]

export const LANDING_TESTIMONIALS = [
  { name: 'Ramesh Kumar', role: 'Mathematics Teacher', text: 'Uploading chapter-wise content has never been easier. My students can access notes and videos exactly when they need them.', avatar: 'RK' },
  { name: 'Aarav Sharma', role: 'Class 9 Student', text: 'I love how everything is organized by chapter. I can watch videos, read notes, and take practice tests all in one place!', avatar: 'AS' },
  { name: 'Priya Patil', role: 'Parent', text: "Now I can see exactly how my daughter is performing in each subject. The progress tracking gives me peace of mind.", avatar: 'PP' },
]

export const LANDING_STATS = [
  { value: 500, suffix: '+', label: 'Students Learning' },
  { value: 40, suffix: '+', label: 'Subjects Covered' },
  { value: 1000, suffix: '+', label: 'Chapters Available' },
  { value: 98, suffix: '%', label: 'Parent Satisfaction' },
]
