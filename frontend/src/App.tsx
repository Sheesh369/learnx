import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { DASHBOARD_PATHS } from '@/lib/constants'
import type { UserRole } from '@/types'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Spinner } from '@/components/ui'

// Layout — always loaded
import DashboardLayout from '@/components/layout/DashboardLayout'

// Public — lazy loaded
const LandingPage = lazy(() => import('@/pages/public/LandingPage'))
const LoginPage = lazy(() => import('@/pages/public/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'))

// Admin — lazy loaded
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const ClassManagement = lazy(() => import('@/pages/admin/ClassManagement'))
const ClassSubjects = lazy(() => import('@/pages/admin/ClassSubjects'))
const SubjectChapters = lazy(() => import('@/pages/admin/SubjectChapters'))
const ChapterContent = lazy(() => import('@/pages/admin/ChapterContent'))
const TeacherManagement = lazy(() => import('@/pages/admin/TeacherManagement'))
const SchoolSettings = lazy(() => import('@/pages/admin/SchoolSettings'))

// Teacher — lazy loaded
const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard'))
const QuestionBank = lazy(() => import('@/pages/shared/QuestionBank'))
const Announcements = lazy(() => import('@/pages/teacher/Announcements'))

// Student — lazy loaded
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'))
const StudentSubjects = lazy(() => import('@/pages/student/StudentSubjects'))
const StudentTests = lazy(() => import('@/pages/student/StudentTests'))
const ProgressTracker = lazy(() => import('@/pages/student/ProgressTracker'))

// Parent — lazy loaded
const ParentDashboard = lazy(() => import('@/pages/parent/ParentDashboard'))
const ChildProgress = lazy(() => import('@/pages/parent/ChildProgress'))
const ParentTestResults = lazy(() => import('@/pages/parent/ParentTestResults'))
const ParentNotifications = lazy(() => import('@/pages/parent/ParentNotifications'))

// Shared
import { ComingSoon } from '@/components/shared/PageHeader'

import './index.css'

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size="lg" text="Loading..." />
    </div>
  )
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !roles.includes(user.role)) return <Navigate to={DASHBOARD_PATHS[user.role] || '/login'} replace />
  return <>{children}</>
}

export default function App() {
  const loadUser = useAuthStore(s => s.loadUser)
  useEffect(() => { loadUser() }, [loadUser])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['school_admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="settings" element={<SchoolSettings />} />
              <Route path="classes" element={<ClassManagement />} />
              <Route path="classes/:classId" element={<ClassSubjects />} />
              <Route path="classes/:classId/:subjectId" element={<SubjectChapters />} />
              <Route path="classes/:classId/:subjectId/:chapterId" element={<ChapterContent />} />
              <Route path="media" element={<ComingSoon title="Media Library" />} />
              <Route path="questions" element={<QuestionBank />} />
              <Route path="teachers" element={<TeacherManagement />} />
            </Route>

            {/* Teacher */}
            <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="subjects" element={<ComingSoon title="My Subjects" />} />
              <Route path="subjects/:subjectId" element={<ComingSoon title="Chapters" />} />
              <Route path="subjects/:subjectId/:chapterId" element={<ComingSoon title="Chapter Content" />} />
              <Route path="questions" element={<QuestionBank />} />
              <Route path="media" element={<ComingSoon title="My Media" />} />
              <Route path="announcements" element={<Announcements />} />
            </Route>

            {/* Student */}
            <Route path="/student" element={<ProtectedRoute roles={['student']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="subjects" element={<StudentSubjects />} />
              <Route path="tests" element={<StudentTests />} />
              <Route path="progress" element={<ProgressTracker />} />
              <Route path="bookmarks" element={<ComingSoon title="Bookmarks" />} />
            </Route>

            {/* Parent */}
            <Route path="/parent" element={<ProtectedRoute roles={['parent']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="progress" element={<ChildProgress />} />
              <Route path="results" element={<ParentTestResults />} />
              <Route path="notifications" element={<ParentNotifications />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
