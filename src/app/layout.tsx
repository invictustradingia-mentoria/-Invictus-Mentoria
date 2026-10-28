import './globals.css'
import { Metadata } from 'net'

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
        {children}
      </body>
    </html>
  )
}