import type { Metadata } from 'next'
import Landing from '../components/landing/Landing'
import LandingBot from '../components/landing/LandingBot'

export const metadata: Metadata = {
  title: 'Invictus Campus',
  description:
    'Aprende trading con metodología ICT sobre el Micro Nasdaq: clases grabadas, sesiones en vivo y seguimiento de tu progreso.',
}

export default function Home() {
  return (
    <>
      <Landing />
      <LandingBot />
    </>
  )
}