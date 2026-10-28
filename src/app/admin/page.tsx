'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Globe,
  Monitor,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  Phone,
  Shield,
  Filter,
} from 'lucide-react'

interface UserItem {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'ADMIN' | 'VIP' | 'STUDENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isBanned: boolean
  registeredIp: string | null
  userAgent: string | null
  createdAt: string
  sessions: {
    currentPage: string | null
    currentLesson: string | null
    lastSeen: string
    ip: string | null
  }[]
  _count: {
    activityLogs: number
    progress: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tabFilter, setTabFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Moderation: Aprobar usuario con un rol específico
  const handleApprove = async (userId: string, assignedRole = 'STUDENT') => {
    try {
      setActionLoading(userId)
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: 'APPROVED',
          role: assignedRole,
          isBanned: false,
        }),
      })
      if (res.ok) {
        setUsers(users.map(u => (u.id === userId ? { ...u, status: 'APPROVED', role: assignedRole as any, isBanned: false } : u)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // Moderation: Rechazar solicitud
  const handleReject = async (userId: string) => {
    try {
      setActionLoading(userId)
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          status: 'REJECTED',
        }),
      })
      if (res.ok) {
        setUsers(users.map(u => (u.id === userId ? { ...u, status: 'REJECTED' } : u)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // Ban / Unban
  const handleToggleBan = async (user: UserItem) => {
    try {
      setActionLoading(user.id)
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isBanned: !user.isBanned,
        }),
      })
      if (res.ok) {
        setUsers(users.map(u => (u.id === user.id ? { ...u, isBanned: !u.isBanned } : u)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // Cambiar rol
  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId)
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })
      if (res.ok) {
        setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole as any } : u)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = users.filter(u => u.status === 'PENDING').length
  const approvedCount = users.filter(u => u.status === 'APPROVED').length

  const filtered = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.registeredIp && u.registeredIp.includes(search))

    const matchesTab = tabFilter === 'ALL' || u.status === tabFilter
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter

    return matchesSearch && matchesTab && matchesRole
  })

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase block">
            CENTRO DE CONTROL
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
            <Users size={22} className="text-[#e25822]" />
            Aprobación y Gestión de Alumnos
          </h1>
          <p className="text-[#86868b] text-[13px] mt-1">
            Los nuevos registros entran como pendientes. Aprueba su acceso y asígnales rol (STUDENT, VIP o ADMIN).
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e5ea] hover:border-[#fcd5c3] hover:text-[#e25822] rounded-xl text-xs font-semibold text-[#555] transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar Lista
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* PENDIENTES DESTACADOS */}
        <div
          onClick={() => setTabFilter('PENDING')}
          className={`rounded-2xl p-4 border transition-all cursor-pointer shadow-sm ${
            tabFilter === 'PENDING'
              ? 'bg-[#fffaf0] border-[#fed7aa] ring-2 ring-[#ea580c]/20'
              : 'bg-white border-[#ededf0] hover:border-[#fed7aa]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[#c2410c] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} />
              Pendientes de Aprobación
            </span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-ping" />
            )}
          </div>
          <p className="text-2xl font-black text-[#ea580c] mt-1.5">{pendingCount}</p>
        </div>

        <div
          onClick={() => setTabFilter('APPROVED')}
          className={`rounded-2xl p-4 border transition-all cursor-pointer shadow-sm ${
            tabFilter === 'APPROVED'
              ? 'bg-[#f0faf4] border-[#b9e6cc] ring-2 ring-[#24a148]/20'
              : 'bg-white border-[#ededf0] hover:border-[#b9e6cc]'
          }`}
        >
          <span className="text-[#24a148] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Alumnos Aprobados
          </span>
          <p className="text-2xl font-black text-[#24a148] mt-1.5">{approvedCount}</p>
        </div>

        <div
          onClick={() => { setTabFilter('ALL'); setRoleFilter('VIP'); }}
          className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm hover:border-[#fcd5c3] cursor-pointer"
        >
          <span className="text-[#86868b] text-[11px] font-semibold uppercase tracking-wider">
            Miembros VIP
          </span>
          <p className="text-2xl font-black text-[#f5a623] mt-1.5">
            {users.filter(u => u.role === 'VIP').length}
          </p>
        </div>

        <div
          onClick={() => { setTabFilter('ALL'); setRoleFilter('ALL'); }}
          className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm hover:border-[#fcd5c3] cursor-pointer"
        >
          <span className="text-[#86868b] text-[11px] font-semibold uppercase tracking-wider">
            Total Solicitudes
          </span>
          <p className="text-2xl font-black text-[#1d1d1f] mt-1.5">{users.length}</p>
        </div>
      </div>

      {/* Tabs de Filtro de Estado (Pendientes / Aprobados / Rechazados / Todos) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="inline-flex p-1 bg-[#f0f0f4] rounded-xl self-start">
          <button
            onClick={() => setTabFilter('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabFilter === 'PENDING'
                ? 'bg-white text-[#ea580c] shadow-sm'
                : 'text-[#6e6e73] hover:text-[#111]'
            }`}
          >
            <span>Pendientes</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#ea580c] text-white rounded-full text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setTabFilter('APPROVED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tabFilter === 'APPROVED'
                ? 'bg-white text-[#24a148] shadow-sm'
                : 'text-[#6e6e73] hover:text-[#111]'
            }`}
          >
            Aprobados
          </button>

          <button
            onClick={() => setTabFilter('REJECTED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tabFilter === 'REJECTED'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-[#6e6e73] hover:text-[#111]'
            }`}
          >
            Rechazados
          </button>

          <button
            onClick={() => setTabFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tabFilter === 'ALL'
                ? 'bg-white text-[#1d1d1f] shadow-sm'
                : 'text-[#6e6e73] hover:text-[#111]'
            }`}
          >
            Todos ({users.length})
          </button>
        </div>

        {/* Buscador & Selector de Rol */}
        <div className="flex gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o IP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-9 pr-3 py-2 text-[12px] text-[#1d1d1f] placeholder:text-[#999] focus:outline-none focus:border-[#e25822] shadow-sm"
            />
          </div>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-white border border-[#e5e5ea] rounded-xl px-3 py-2 text-[12px] text-[#1d1d1f] focus:outline-none focus:border-[#e25822] cursor-pointer shadow-sm font-medium"
          >
            <option value="ALL">Cualquier Rol</option>
            <option value="STUDENT">STUDENT</option>
            <option value="VIP">VIP</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="rounded-2xl border border-[#ededf0] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#fbfbfd] border-b border-[#ededf0] text-[11px] text-[#86868b] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Alumno / Solicitante</th>
                <th className="px-6 py-3.5">Estado Aprobación</th>
                <th className="px-6 py-3.5">Rol Asignado</th>
                <th className="px-6 py-3.5">Auditoría IP</th>
                <th className="px-6 py-3.5">Fecha Registro</th>
                <th className="px-6 py-3.5 text-right">Acciones de Aprobación & Moderación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f4f7]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#86868b]">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-[#e25822] border-t-transparent rounded-full animate-spin" />
                      Cargando solicitudes y alumnos...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#86868b]">
                    No hay solicitudes ni usuarios en esta vista.
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-[#fafafc] transition-colors">
                    {/* Alumno Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                            user.status === 'PENDING'
                              ? 'bg-[#fffaf0] border-[#fed7aa] text-[#ea580c]'
                              : user.status === 'APPROVED'
                              ? 'bg-[#fff4ef] border-[#fcd5c3] text-[#e25822]'
                              : 'bg-gray-100 border-gray-200 text-gray-500'
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1d1d1f] leading-tight">{user.name}</p>
                          <p className="text-[11px] text-[#86868b] font-mono">{user.email}</p>
                          {user.phone && (
                            <span className="flex items-center gap-1 text-[11px] text-[#999] mt-0.5">
                              <Phone size={10} /> {user.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Estado de Aprobación */}
                    <td className="px-6 py-4">
                      {user.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fffaf0] text-[#c2410c] border border-[#fed7aa]">
                          <Clock size={12} className="animate-spin text-[#ea580c]" />
                          PENDIENTE
                        </span>
                      ) : user.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f0faf4] text-[#24a148] border border-[#b9e6cc]">
                          <CheckCircle2 size={12} />
                          APROBADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
                          <XCircle size={12} />
                          RECHAZADO
                        </span>
                      )}
                    </td>

                    {/* Selector de Rol */}
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={actionLoading === user.id}
                        onChange={e => handleChangeRole(user.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer transition-colors ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.role === 'VIP'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-[#fff4ef] text-[#e25822] border-[#fcd5c3]'
                        }`}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="VIP">VIP</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    {/* Auditoría IP */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs font-mono text-[#333]">
                          <Globe size={12} className="text-[#e25822] shrink-0" />
                          {user.registeredIp || '127.0.0.1'}
                        </span>
                        {user.userAgent && (
                          <span
                            className="flex items-center gap-1 text-[11px] text-[#999] truncate max-w-[150px]"
                            title={user.userAgent}
                          >
                            <Monitor size={10} className="shrink-0" />
                            {user.userAgent}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Fecha de Registro */}
                    <td className="px-6 py-4 text-xs text-[#6e6e73]">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#999]" />
                        {new Date(user.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApprove(user.id, user.role)}
                              disabled={actionLoading === user.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#24a148] hover:bg-[#1f8b3d] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                              title="Aprobar acceso a la plataforma"
                            >
                              <Check size={13} className="stroke-[3]" />
                              Aprobar
                            </button>

                            <button
                              onClick={() => handleReject(user.id)}
                              disabled={actionLoading === user.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#e5e5ea] text-red-600 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                              title="Rechazar solicitud"
                            >
                              <X size={13} />
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <>
                            {user.status === 'REJECTED' && (
                              <button
                                onClick={() => handleApprove(user.id, user.role)}
                                disabled={actionLoading === user.id}
                                className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-semibold hover:bg-green-100 cursor-pointer"
                              >
                                Re-Aprobar
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleBan(user)}
                              disabled={actionLoading === user.id}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                user.isBanned
                                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                  : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                              }`}
                            >
                              {user.isBanned ? 'Desbanear' : 'Banear'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
