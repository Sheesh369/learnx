import { useState, useEffect } from 'react'
import { useDocTitle } from '@/lib/useDocTitle'
import LandingNav from './landing/LandingNav'
import HeroSection from './landing/HeroSection'
import { FeaturesSection, GallerySection, HowItWorksSection, TestimonialsSection, BoardsSection, WhyUsSection, CTASection, FooterSection } from './landing/LandingSections'
import './LandingPage.css'

export default function LandingPage() {
  useDocTitle('Home')
  const [scrolled, setScrolled] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingNav scrolled={scrolled} />
      <HeroSection imgIdx={imgIdx} setImgIdx={setImgIdx} />
      <FeaturesSection />
      <GallerySection />
      <HowItWorksSection />
      <TestimonialsSection />
      <BoardsSection />
      <WhyUsSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
