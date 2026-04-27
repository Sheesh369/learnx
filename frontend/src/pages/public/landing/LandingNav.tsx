import { Link } from 'react-router-dom'

interface LandingNavProps {
  scrolled: boolean
}

export default function LandingNav({ scrolled }: LandingNavProps) {
  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-100' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Learnexa" className="h-10 object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Boards', 'Why Us'].map(i => (
              <a key={i} href={`#${i.toLowerCase().replace(/\s+/g, '-')}`} className={`text-sm font-medium transition-colors ${scrolled ? 'text-neutral-600 hover:text-primary-600' : 'text-white/80 hover:text-white'}`}>{i}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className={`text-sm font-medium px-4 py-2 rounded-lg ${scrolled ? 'text-neutral-700 hover:text-primary-600' : 'text-white/90 hover:text-white'}`}>Log in</Link>
            <Link to="/register" className="text-sm font-semibold px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm">Get Started</Link>
          </div>
        </div>
      </div>
    </header>
  )
}
