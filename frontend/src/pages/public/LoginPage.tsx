import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { APP_NAME, SCHOOL_NAME } from '@/lib/constants'
import { useDocTitle } from '@/lib/useDocTitle'
import { loginSchema, validateForm } from '@/lib/validation'

export default function LoginPage() {
  useDocTitle('Login')
  const { login, isLoading, error, isAuthenticated, clearError, getDashboardPath } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const errors = validateForm(loginSchema, { email, password })
    if (errors) { setFieldErrors(errors); return }
    setFieldErrors({})
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 text-white flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <img src="/logo.png" alt="Learnexa" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Welcome back to {APP_NAME}</h1>
          <p className="text-primary-200 text-lg">{SCHOOL_NAME}</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-neutral-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <img src="/logo.png" alt="Learnexa" className="h-9 object-contain" />
          </div>

          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-1">Log in to your account</h2>
          <p className="text-neutral-500 text-sm mb-8">Enter your credentials to access the dashboard.</p>

          {error && (
            <div className="mb-6 p-3 bg-danger-50 border border-danger-100 text-danger-600 text-sm rounded-xl">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-colors"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-danger-600 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-danger-600 mt-1">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Log in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Don&apos;t have an account? <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
