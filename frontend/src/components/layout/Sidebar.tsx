import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Settings, BookOpen, Users,
  ClipboardList, Brain, Bell, TrendingUp, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { APP_NAME } from '@/lib/constants'
import { getInitials } from '@/lib/utils'
import type { NavItem } from '@/types'

interface NavGroup { label: string; items: NavItem[] }

const GROUPED_NAV: Record<string, NavGroup[]> = {
  school_admin: [
    { label: 'OVERVIEW', items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: 'School Settings', icon: Settings, path: '/admin/settings' },
    ]},
    { label: 'CONTENT', items: [
      { label: 'Classes', icon: BookOpen, path: '/admin/classes' },
      { label: 'Question Bank', icon: Brain, path: '/admin/questions' },
    ]},
    { label: 'PEOPLE', items: [
      { label: 'Teachers', icon: Users, path: '/admin/teachers' },
    ]},
  ],
  teacher: [
    { label: 'OVERVIEW', items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
    ]},
    { label: 'MY CLASSES', items: [
      { label: 'My Subjects', icon: BookOpen, path: '/teacher/subjects' },
      { label: 'Question Bank', icon: Brain, path: '/teacher/questions' },
    ]},
    { label: 'COMMUNICATION', items: [
      { label: 'Announcements', icon: Bell, path: '/teacher/announcements' },
    ]},
  ],
  student: [
    { label: 'OVERVIEW', items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    ]},
    { label: 'LEARNING', items: [
      { label: 'My Subjects', icon: BookOpen, path: '/student/subjects' },
      { label: 'Tests', icon: ClipboardList, path: '/student/tests' },
      { label: 'Progress', icon: TrendingUp, path: '/student/progress' },
    ]},
  ],
  parent: [
    { label: 'OVERVIEW', items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/parent/dashboard' },
    ]},
    { label: 'MY CHILD', items: [
      { label: 'Child Progress', icon: TrendingUp, path: '/parent/progress' },
      { label: 'Test Results', icon: ClipboardList, path: '/parent/results' },
      { label: 'Notifications', icon: Bell, path: '/parent/notifications' },
    ]},
  ],
}

const ROLE_LABELS: Record<string, string> = {
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onCloseMobile?: () => void
}

export default function Sidebar({ collapsed, onToggle, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const role = user?.role || 'student'
  const groups = GROUPED_NAV[role] || GROUPED_NAV.student

  const navigate = useNavigate()
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Logo — h-14 matches topbar height so borders align */}
      <div className={`flex items-center border-b border-neutral-200 h-14 ${collapsed ? 'px-3 justify-center' : 'px-5'}`}>
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Learnexa"
            className={`object-contain ${collapsed ? 'h-8 w-8' : 'h-8 w-full max-w-[160px]'}`}
          />
        </Link>
      </div>

      {/* Navigation — grouped */}
      <nav className={`flex-1 py-3 overflow-y-auto space-y-5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{group.label}</div>
            )}
            {collapsed && <div className="w-full h-px bg-neutral-200 mb-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-semibold'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile + Logout at bottom */}
      <div className="border-t border-neutral-200">
        {/* User profile */}
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}`}>
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary-700">{getInitials(user?.name || '')}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-neutral-900 leading-tight truncate">{user?.name}</div>
              <div className="text-[11px] text-neutral-500">{ROLE_LABELS[role]}</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className={`${collapsed ? 'px-2' : 'px-3'} pb-4`}>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Log out' : undefined}
            className={`flex items-center gap-3 w-full py-2.5 text-sm font-medium text-neutral-500 hover:text-danger-600 hover:bg-danger-50 rounded-xl transition-colors ${
              collapsed ? 'justify-center px-2' : 'px-3'
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </div>

      {/* Collapse toggle — tiny arrow on the right edge of sidebar */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-white border border-neutral-200 rounded-full items-center justify-center shadow-sm hover:bg-neutral-50 hover:shadow transition-all z-50"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-neutral-500" /> : <ChevronLeft className="w-3.5 h-3.5 text-neutral-500" />}
      </button>
    </div>
  )
}
