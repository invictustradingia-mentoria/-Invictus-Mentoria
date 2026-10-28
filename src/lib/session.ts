import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  return session
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if ((session.user as any).role !== 'ADMIN') redirect('/dashboard')
  return session
}

export async function getSession() {
  return await getServerSession(authOptions)
}
