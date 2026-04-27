import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SCHOOL_NAME } from '@/lib/constants'
import { LANDING_STATS } from '@/lib/mockData'
import { useCounter } from './LandingUtils'

const HERO_IMAGES = ['/students-learning.png', '/teacher-classroom.png', '/students-outdoor.png']

interface HeroSectionProps {
  imgIdx: number
  setImgIdx: (idx: number) => void
}

export default function HeroSection({ imgIdx, setImgIdx }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d3b10 0%, #1b5e20 30%, #00695c 60%, #004d40 100%)' }}>
      <div className="absolute inset-0 mesh-grid" />
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-primary-400/15 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-400/10 rounded-full blur-[100px] animate-pulse-glow-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-rotate-slow" />

      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="particle" style={{ left: `${Math.random() * 100}%`, top: `${50 + Math.random() * 50}%`, animation: `particle-rise ${8 + Math.random() * 12}s linear ${Math.random() * 8}s infinite`, width: `${2 + Math.random() * 2}px`, height: `${2 + Math.random() * 2}px` }} />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-32 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
              Where Learning<br />
              <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-yellow-300 bg-clip-text text-transparent animate-gradient">Meets Structure</span>
            </h1>
            <p className="max-w-lg text-lg text-white/70 mb-8 leading-relaxed">
              The chapter-wise education platform where teachers upload content, students learn at their pace, and everyone sees real results — from Class 1 to 10.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link to="/register" className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl text-sm">
                Start Free Today <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 backdrop-blur-sm border border-white/10 text-sm">
                See How It Works
              </a>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {LANDING_STATS.map((s, i) => {
                const { count, ref } = useCounter(s.value)
                return (
                  <div key={i} ref={ref} className="text-center p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="font-display text-2xl font-black text-white">{count}{s.suffix}</div>
                    <div className="text-[10px] text-white/50 mt-0.5 font-medium">{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10">
              {HERO_IMAGES.map((src, i) => (
                <img key={i} src={src} alt="School life" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === imgIdx ? 'opacity-100' : 'opacity-0'}`} />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <p className="text-white text-sm font-medium">📚 {SCHOOL_NAME}</p>
                <p className="text-white/70 text-xs">Empowering students with chapter-wise learning</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {HERO_IMAGES.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-8' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
