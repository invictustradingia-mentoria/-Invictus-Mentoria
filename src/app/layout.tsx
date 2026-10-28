import './globals.css'
import React from 'react'
import { Providers } from './providers'

export const metadata = {
  title: 'Invictus Mentoria',
  description: 'Plataforma oficial de formación y trading',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-[#fdfdfd] text-[#1d1d1f] antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}