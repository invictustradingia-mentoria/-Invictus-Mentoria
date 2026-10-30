'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  RefreshCw, Search, Clock, CheckCircle2, Users, AlertCircle, Check, X, Ban,
  ShieldOff, Pencil, Trash2, Save,
} from 'lucide-react'

interface Student {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  isBanned: boolean
  phone: string | null
  registeredIp: string | null
  createdAt: string
}

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED'

async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { error: `Respuesta no válida del servidor (HTTP ${res.status})` }
  }
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

const statusStyle: Record<string, string> = {
  PENDING: 'bg-sky-100 text-sky-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
}

export default function AdminStudentsPage() {
  const [users, setUsers] = useState<Student[]>([])
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [edit, setEdit] = useState<{ id: string; name: string; phone: string; email: string } | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/admin/students', { cache: 'no-store' })
      const data = await safeJson(res)
      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users)
        setCurrentEmail(data.currentEmail ?? null)
      } else {
        setLoadError(data.error || `No se pudo cargar la lista (HTTP ${res.status})`)
      }
    } catch (err: any) {
      setLoadError('Error de conexión al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const notify = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const patchUser = async (id: string, changes: Record<string, any>, okText: string) => {
    setBusyId(id)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...changes }),
      })
      const data = await safeJson(res)
      if (res.ok && data.success && data.user) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)))
        notify(okText, 'success')
        return true
      }
      notify(data.error || `Error al guardar (HTTP ${res.status})`, 'error')
      return false
    } catch {
      notify('Error de conexión', 'error')
      return false
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (u: Student) => {
    if (!confirm(`¿Eliminar a ${u.name || u.email}? Se borrará también su progreso y sus sesiones. Esta acción no se puede deshacer.`)) return
    setBusyId(u.id)
    try {
      const res = await fetch(`/api/admin/students?id=${u.id}`, { method: 'DELETE' })
      const data = await safeJson(res)
      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((x) => x.id !== u.id))
        notify('Usuario eliminado', 'success')
      } else {
        notify(data.error || `Error al eliminar (HTTP ${res.status})`, 'error')
      }
    } catch {
      notify('Error de conexión', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!edit) return
    const ok = await patchUser(edit.id, { name: edit.name, phone: edit.phone }, 'Datos actualizados')
    if (ok) setEdit(null)
  }

  const counts = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((u) => u.status === 'PENDING').length,
      approved: users.filter((u) => u.status === 'APPROVED').length,
      rejected: users.filter((u) => u.status === 'REJECTED').length,
      banned: users.filter((u) => u.isBanned).length,
    }),
    [users]
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (filter === 'PENDING' && u.status !== 'PENDING') return false
      if (filter === 'APPROVED' && u.status !== 'APPROVED') return false
      if (filter === 'REJECTED' && u.status !== 'REJECTED') return false
      if (filter === 'BANNED' && !u.isBanned) return false
      if (q && !(u.email.toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q))) return false
      return true
    })
  }, [users, filter, search])

  const tabs: { key: Filter; label: string; n: number }[] = [
    { key: 'ALL', label: 'Todos', n: counts.total },
    { key: 'PENDING', label: 'Pendientes', n: counts.pending },
    { key: 'APPROVED', label: 'Aprobados', n: counts.approved },
    { key: 'REJECTED', label: 'Rechazados', n: counts.rejected },
    { key: 'BANNED', label: 'Baneados', n: counts.banned },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#fdfdfd] min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1d1d1f]">Aprobación y Gestión de Alumnos</h1>
          <p className="text-xs text-gray-500 mt-1">Controla el acceso de nuevos usuarios y asigna sus roles institucionales.</p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-2 self-start rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-[#1d1d1f] shadow-sm hover:border-[#0284c7] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar Lista
        </button>
      </div>

      {/* Errores */}
      {loadError && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p>No se pudo cargar la lista de usuarios:</p>
            <p className="mt-1 font-normal break-all">{loadError}</p>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-bold ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Tarjetas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-3xl border border-[#ededf0] bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-500">Pendientes de Aprobación</p>
            <p className="mt-1 text-3xl font-black text-sky-500">{counts.pending}</p>
          </div>
          <Clock size={26} className="text-sky-400" />
        </div>
        <div className="flex items-center justify-between rounded-3xl border border-[#ededf0] bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-500">Alumnos Aprobados</p>
            <p className="mt-1 text-3xl font-black text-emerald-600">{counts.approved}</p>
          </div>
          <CheckCircle2 size={26} className="text-emerald-400" />
        </div>
        <div className="flex items-center justify-between rounded-3xl border border-[#ededf0] bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-500">Total Solicitudes</p>
            <p className="mt-1 text-3xl font-black text-[#1d1d1f]">{counts.total}</p>
          </div>
          <Users size={26} className="text-gray-400" />
        </div>
      </div>

      {/* Filtros y buscador */}
      <div className="flex flex-col gap-3 rounded-3xl border border-[#ededf0] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                filter === t.key ? 'bg-[#1d1d1f] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label} ({t.n})
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email o nombre..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-3 text-xs focus:border-[#0284c7] focus:outline-none"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-3xl border border-[#ededf0] bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] uppercase tracking-wider text-gray-500">
              <th className="px-5 py-3 font-bold">Alumno / Solicitante</th>
              <th className="px-5 py-3 font-bold">Estado aprobación</th>
              <th className="px-5 py-3 font-bold">Rol institucional</th>
              <th className="px-5 py-3 font-bold">IP de registro</th>
              <th className="px-5 py-3 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">Cargando usuarios...</td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                  {loadError ? 'No se pudo cargar la lista.' : 'No se encontraron usuarios.'}
                </td>
              </tr>
            ) : (
              visible.map((u) => {
                const isSelf = !!currentEmail && u.email === currentEmail
                const busy = busyId === u.id
                return (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                    <td className="px-5 py-3">
                      <p className="font-bold text-[#1d1d1f]">
                        {u.name || 'Sin nombre'}
                        {isSelf && <span className="ml-2 rounded-md bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-600">Tú</span>}
                      </p>
                      <p className="text-[11px] text-gray-500">{u.email}</p>
                      {u.phone && <p className="text-[11px] text-gray-400">{u.phone}</p>}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[u.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[u.status] ?? u.status}
                        </span>
                        {u.isBanned && (
                          <span className="rounded-md bg-black px-2 py-0.5 text-[10px] font-bold uppercase text-white">Baneado</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <select
                        value={u.role}
                        disabled={busy || isSelf}
                        onChange={(e) => patchUser(u.id, { role: e.target.value }, `Rol cambiado a ${e.target.value}`)}
                        className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-1.5 text-xs font-bold text-[#0284c7] focus:border-[#0284c7] focus:outline-none disabled:opacity-50"
                      >
                        <option value="CLUB">CLUB</option>
                        <option value="MENTORIA">MENTORIA</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="px-5 py-3 text-gray-500">{u.registeredIp || '—'}</td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {u.status !== 'APPROVED' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => patchUser(u.id, { status: 'APPROVED' }, 'Usuario aprobado')}
                            className="flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 cursor-pointer"
                            title="Aprobar"
                          >
                            <Check size={13} /> Aprobar
                          </button>
                        )}
                        {u.status !== 'REJECTED' && !isSelf && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => patchUser(u.id, { status: 'REJECTED' }, 'Usuario rechazado')}
                            className="flex items-center gap-1 rounded-xl bg-sky-50 px-2.5 py-1.5 text-[11px] font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-50 cursor-pointer"
                            title="Rechazar"
                          >
                            <X size={13} /> Rechazar
                          </button>
                        )}
                        {!isSelf && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              patchUser(u.id, { isBanned: !u.isBanned }, u.isBanned ? 'Usuario desbaneado' : 'Usuario baneado')
                            }
                            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-50 cursor-pointer ${
                              u.isBanned ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-black'
                            }`}
                            title={u.isBanned ? 'Quitar baneo' : 'Banear'}
                          >
                            {u.isBanned ? <ShieldOff size={13} /> : <Ban size={13} />}
                            {u.isBanned ? 'Desbanear' : 'Banear'}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setEdit({ id: u.id, name: u.name ?? '', phone: u.phone ?? '', email: u.email })}
                          className="rounded-xl p-2 text-gray-500 hover:bg-[#f0f9ff] hover:text-[#0284c7] disabled:opacity-50 cursor-pointer"
                          title="Editar datos"
                        >
                          <Pencil size={14} />
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(u)}
                            className="rounded-xl p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal editar */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#1d1d1f]">Editar usuario</h3>
              <button type="button" onClick={() => setEdit(null)} className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Email</label>
                <input
                  type="text"
                  value={edit.email}
                  disabled
                  className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-xs text-gray-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs focus:border-[#0284c7] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700">Teléfono</label>
                <input
                  type="text"
                  value={edit.phone}
                  onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-xs focus:border-[#0284c7] focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEdit(null)}
                  className="flex-1 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busyId === edit.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#1d1d1f] py-3 text-xs font-bold text-white hover:bg-[#0284c7] disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}