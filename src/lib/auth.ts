import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prismaDash } from '@/lib/prisma-dashboard'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: '/login' },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password
        if (!email || !password) throw new Error('INVALID')

        const user = await prismaDash.user.findUnique({ where: { email } })
        if (!user) throw new Error('INVALID')

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) throw new Error('INVALID')

        // Se comprueba después de validar la contraseña para no revelar qué correos existen
        if (user.isBanned) throw new Error('BANNED')
        if (user.status === 'PENDING') throw new Error('PENDING')
        if (user.status === 'REJECTED') throw new Error('REJECTED')

        return { id: user.id, name: user.name, email: user.email, role: user.role } as any
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
      }

      // Revalida contra la base en cada petición
      if (token.id) {
        const db = await prismaDash.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, status: true, isBanned: true },
        })

        if (!db || db.isBanned || db.status !== 'APPROVED') {
          token.blocked = true
        } else {
          token.blocked = false
          token.role = db.role
        }
      }
      return token
    },

    async session({ session, token }) {
      // Usuario bloqueado: la sesión queda sin usuario y las páginas lo mandan a /login
      if (token.blocked) {
        return { expires: session.expires } as any
      }
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
}