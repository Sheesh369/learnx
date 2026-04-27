import { Search, Menu } from 'lucide-react'
import { SCHOOL_NAME } from '@/lib/constants'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
        {/* Left — School name */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-800">{SCHOOL_NAME}</h1>
        </div>

        {/* Right — Search bar */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-neutral-100 border border-neutral-200 rounded-xl w-64 sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input placeholder="Search chapters, topics..." className="bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 outline-none border-none focus:ring-0 w-full" />
        </div>
      </div>
    </header>
  )
}
