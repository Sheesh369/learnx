import { useState, useEffect, useRef } from 'react'

/** Animated counter that triggers on scroll into view */
export function useCounter(target: number, dur = 2000) {
  const [c, setC] = useState(0), [go, setGo] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); o.disconnect() } }, { threshold: 0.5 })
    o.observe(el)
    return () => o.disconnect()
  }, [])
  useEffect(() => {
    if (!go) return
    let v = 0
    const s = target / (dur / 16)
    const t = setInterval(() => { v += s; if (v >= target) { setC(target); clearInterval(t) } else setC(Math.floor(v)) }, 16)
    return () => clearInterval(t)
  }, [go, target, dur])
  return { count: c, ref }
}

/** Scroll-reveal wrapper */
export function Reveal({ children, className = '', delay = '' }: { children: React.ReactNode; className?: string; delay?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); o.disconnect() } }, { threshold: 0.15 })
    o.observe(el)
    return () => o.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${delay} ${className}`}>{children}</div>
}
