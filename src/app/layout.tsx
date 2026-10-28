import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Invictus Master | Mentoría de Trading',
  description: 'Plataforma oficial de formación y mentoría de trading.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-[#fcfcfd] text-[#2d2d2d] font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
