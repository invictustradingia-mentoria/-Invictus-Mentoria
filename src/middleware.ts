import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/parse'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Permitir el acceso a assets estaticos e imagenes
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verificar el token de NextAuth leyendo las cookies de produccion de Netlify
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // Soporte para HTTPS seguro en Netlify
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
  })

  // Si intenta acceder a rutas protegidas sin sesion, redirigir a /login
  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/dashboard')

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Si ya inicio sesion e intenta ir al login, mandar al panel
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
}