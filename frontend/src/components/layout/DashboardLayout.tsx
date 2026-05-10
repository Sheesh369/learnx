import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ProcessingManager from '@/components/shared/ProcessingManager'
import ProcessingStatusBar from '@/components/shared/ProcessingStatusBar'
import { ToastContainer } from '@/components/ui'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">
      <ProcessingManager />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 shadow-lg transform transition-transform lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4 z-10">
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar collapsed={false} onToggle={() => {}} onCloseMobile={() => setSidebarOpen(false)} />
      </aside>

      {/* Sidebar — desktop */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col bg-white border-r border-neutral-200 transition-all duration-200 ${
          collapsed ? 'lg:w-[68px]' : 'lg:w-64'
        }`}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-200 ${collapsed ? 'lg:pl-[68px]' : 'lg:pl-64'}`}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <ProcessingStatusBar />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  )
}
