import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import CookieBar from '@/components/CookieBar'

const inter = Inter({ subsets: ['latin'] })
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://invictus-mentoria.netlify.app'),
  title: 'Invictus Mentoría - Plataforma de Trading',
  description: 'Plataforma Institucional de Trading y Mentoría Avanzada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('inv-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})();` }} />
      </head>
      <body className={`${inter.className} ${lora.variable}`}>
        <Providers>{children}</Providers>
        <CookieBar />
      </body>
    </html>
  )
}
