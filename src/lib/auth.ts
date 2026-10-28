import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        ip: { label: 'IP', type: 'text' },
        userAgent: { label: 'User Agent', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Normalizamos el correo (minúsculas y sin espacios invisibles)
        const cleanEmail = credentials.email.trim().toLowerCase()

        // Buscamos al usuario en la base de datos de Supabase
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
        })

        if (!user || !user.password) return null

        // 1. Validar si está baneado
        if (user.isBanned) {
          throw new Error('BANNED')
        }

        // 2. Validar estado de aprobación
        if (user.status === 'PENDING') {
          throw new Error('PENDING_APPROVAL')
        }

        if (user.status === 'REJECTED') {
          throw new Error('REJECTED')
        }

        // 3. Validar contraseña encriptada con bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // Registrar log de actividad de forma segura
        try {
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN',
              page: '/login',
              ip: credentials.ip || null,
              userAgent: credentials.userAgent || null,
            },
          })
        } catch {
          // No bloquear el inicio de sesión si falla la escritura del log
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.status = (user as any).status
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).status = token.status
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)