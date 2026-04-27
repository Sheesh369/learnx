import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, ChevronRight, Star, CheckCircle2 } from 'lucide-react'
import { SCHOOL_NAME, APP_NAME, SUPPORTED_BOARDS } from '@/lib/constants'
import { LANDING_FEATURES, LANDING_STEPS, LANDING_TESTIMONIALS } from '@/lib/mockData'
import { Reveal } from './LandingUtils'

const HERO_IMAGES = ['/students-learning.png', '/teacher-classroom.png', '/students-outdoor.png']

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-wider mb-3"><Sparkles className="w-3.5 h-3.5" /> Features</span>
          <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-neutral-900 mb-4">Everything Your School Needs</h2>
          <p className="text-neutral-500 max-w-xl mx-auto text-lg">From content management to analytics — one platform for everyone.</p>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANDING_FEATURES.map((f, i) => (
            <Reveal key={i} delay={`reveal-delay-${(i % 3) + 1}`}>
              <div className="group relative p-7 bg-white border border-neutral-200 rounded-2xl transition-all duration-300 hover:shadow-xl hover:border-transparent hover:-translate-y-1 overflow-hidden h-full">
                <div className={`w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function GallerySection() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-3">Life at {SCHOOL_NAME}</h2>
          <p className="text-neutral-500">Where learning meets joy — see our students thrive every day.</p>
        </Reveal>
        <div className="grid grid-cols-3 gap-4">
          {HERO_IMAGES.map((src, i) => (
            <Reveal key={i} delay={`reveal-delay-${i + 1}`}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group shadow-md">
                <img src={src} alt={`School life ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-wider mb-3"><ArrowRight className="w-3.5 h-3.5" /> How It Works</span>
          <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-neutral-900 mb-4">Simple for Everyone</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LANDING_STEPS.map((s, i) => (
            <Reveal key={i} delay={`reveal-delay-${i + 1}`}>
              <div className="relative p-6 bg-white border border-neutral-200 rounded-2xl hover:shadow-lg transition-all h-full group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-display font-bold text-sm rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">{s.n}</div>
                <h3 className="font-display text-base font-bold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 z-10"><ChevronRight className="w-5 h-5 text-neutral-300" /></div>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-wider mb-3"><Star className="w-3.5 h-3.5" /> Testimonials</span>
          <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-neutral-900 mb-4">Loved by Our School Community</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {LANDING_TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={`reveal-delay-${i + 1}`}>
              <div className="p-6 bg-white border border-neutral-200 rounded-2xl hover:shadow-lg transition-all h-full">
                <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-accent-500 fill-accent-500" />)}</div>
                <p className="text-sm text-neutral-600 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                  <div><p className="text-sm font-semibold text-neutral-900">{t.name}</p><p className="text-xs text-neutral-500">{t.role}</p></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BoardsSection() {
  return (
    <section id="boards" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-neutral-900 mb-4">Built for Indian Boards</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {SUPPORTED_BOARDS.map((b, i) => (
            <Reveal key={b.value} delay={`reveal-delay-${i + 1}`}>
              <div className="p-8 bg-white border border-neutral-200 rounded-2xl text-center hover:shadow-lg transition-all">
                <img src="/logo.png" alt="Learnexa" className="w-14 h-14 object-contain mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">{b.label}</h3>
                <p className="text-sm text-neutral-500 mb-5">{b.value === 'KSEEB' ? 'Karnataka State Board' : 'Central Board'}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {(b.value === 'KSEEB' ? ['Kannada', 'English', 'Hindi', 'Mathematics', 'Science', 'Social Science'] : ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer Science']).map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WhyUsSection() {
  return (
    <section id="why-us" className="py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16"><h2 className="font-display text-3xl lg:text-5xl font-extrabold text-neutral-900">Why {APP_NAME}?</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {['Chapter-wise organization matching real teaching flow', 'Multi-role access: Admin, Teacher, Student, Parent', 'Auto-generated test papers from question banks', 'Real-time analytics and progress tracking', 'YouTube integration and rich media support', 'Built specifically for Indian K-10 education'].map((t, i) => (
            <Reveal key={i} delay={`reveal-delay-${(i % 3) + 1}`}>
              <div className="flex items-start gap-3 p-5 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-all">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" /><span className="text-sm text-neutral-700">{t}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b5e20 0%, #00695c 50%, #0d3b10 100%)' }}>
      <div className="absolute inset-0 mesh-grid" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl lg:text-5xl font-extrabold text-white mb-4">Ready to Transform Your School?</h2>
        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">Join {SCHOOL_NAME} on {APP_NAME} and give every student a structured path to success.</p>
        <Link to="/register" className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 shadow-xl text-base">
          Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}

export function FooterSection() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Learnexa" className="h-8 object-contain" />
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} {SCHOOL_NAME}. Built with {APP_NAME}.</p>
      </div>
    </footer>
  )
}
