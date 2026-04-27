import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronDown, Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { APP_NAME, SCHOOL_NAME, DASHBOARD_PATHS } from '@/lib/constants'
import type { UserRole } from '@/types'
import { useDocTitle } from '@/lib/useDocTitle'
import { registerSchema, validateForm } from '@/lib/validation'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'school_admin', label: 'School Admin' },
]

export default function RegisterPage() {
  useDocTitle('Register')
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const { register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    const errors = validateForm(registerSchema, { name, email, password, role: role || undefined, class_name: className || undefined, section: section || undefined })
    if (errors) { setFieldErrors(errors); return }
    setFieldErrors({})
    try {
      await register({
        name, email, password, role,
        ...(role === 'student' ? { class_name: className, section } : {}),
      })
      const user = useAuthStore.getState().user
      if (user) navigate(DASHBOARD_PATHS[user.role] || '/')
    } catch {
      // Error is set in the store
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-secondary-700 via-primary-600 to-primary-700 items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">Join {APP_NAME}</h2>
          <p className="text-primary-100 text-lg">{SCHOOL_NAME}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
            <span className="font-display text-xl font-bold text-neutral-900">{APP_NAME}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">Create your account</h1>
          <p className="text-neutral-500 mb-8">Fill in your details to get started.</p>

          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger-600 font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
              </div>
              {fieldErrors.name && <p className="text-xs text-danger-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type="email" required placeholder="you@ssb.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
              </div>
              {fieldErrors.email && <p className="text-xs text-danger-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">I am a</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <select required value={role} onChange={(e) => setRole(e.target.value)} className="w-full pl-11 pr-10 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all">
                  <option value="" disabled>Select your role</option>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
              </div>
              {fieldErrors.role && <p className="text-xs text-danger-600 mt-1">{fieldErrors.role}</p>}
            </div>
            {role === 'student' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Class</label>
                  <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
                    <option value="">Select</option>
                    {Array.from({length:10},(_,i) => <option key={i} value={String(i+1)}>Class {i+1}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Section</label>
                  <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/20">
                    <option value="">Select</option>
                    <option>A</option><option>B</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input type={showPw ? 'text' : 'password'} required placeholder="Min 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-danger-600 mt-1">{fieldErrors.password}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-8">Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Log in</Link></p>
        </div>
      </div>
    </div>
  )
}
