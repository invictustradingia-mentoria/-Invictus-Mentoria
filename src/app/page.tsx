import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Benefits } from '@/components/landing/Benefits'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fcfcfd] text-[#2d2d2d]">
      <Navbar />
      <Hero />
      <Benefits />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
