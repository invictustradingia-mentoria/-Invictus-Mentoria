'use client'

import { useState, useEffect } from 'react'
import { Users, Shield, CheckCircle, RefreshCw, Trash2, Clock, XCircle, Search } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  registeredIp: string | null
  createdAt: string
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      })
      if (res.ok) fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      if (res.ok) fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const pendingCount = users.filter((u) => u.status === 'PENDING').length
  const approvedCount = users.filter((u) => u.status === 'APPROVED').length

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === 'ALL' || u.status === filter
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Aprobación y Gestión de Alumnos</h1>
          <p className="text-sm text-[#86868b]">Controla el acceso de nuevos usuarios y asigna sus roles institucionales.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-[#ededf0] hover:bg-gray-50 cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} />
          Actualizar Lista
        </button>
      </div>

      {/* Tarjetas de métricas superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#ededf0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Pendientes de Aprobación</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</p>
          </div>
          <Clock size={28} className="text-orange-500 opacity-80" />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#ededf0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Alumnos Aprobados</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
          </div>
          <CheckCircle size={28} className="text-green-500 opacity-80" />
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#ededf0] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Solicitudes</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{users.length}</p>
          </div>
          <Users size={28} className="text-gray-400" />
        </div>
      </div>

      {/* Filtros y buscador */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#ededf0] shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-[#1d1d1f] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'PENDING' ? 'bg-[#1d1d1f] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === 'APPROVED' ? 'bg-[#1d1d1f] text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Aprobados ({approvedCount})
          </button>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
          />
        </div>
      </div>

      {/* Tabla de alumnos */}
      <div className="bg-white rounded-2xl border border-[#ededf0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ededf0] bg-[#fafafc] text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                <th className="p-4">Alumno / Solicitante</th>
                <th className="p-4">Estado Aprobación</th>
                <th className="p-4">Rol Institucional</th>
                <th className="p-4">IP de Registro</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ededf0] text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fafafc] transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#1d1d1f]">{user.name || 'Sin nombre'}</p>
                      <p className="text-[11px] text-[#86868b]">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-white text-[#e25822] focus:outline-none focus:border-[#e25822] cursor-pointer"
                      >
                        <option value="CLUB">CLUB</option>
                        <option value="MENTORIA">MENTORIA</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-gray-500">{user.registeredIp || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.status !== 'APPROVED' ? (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-green-500 text-white hover:bg-green-600 transition-all cursor-pointer"
                          >
                            Aprobar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'PENDING')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all cursor-pointer"
                          >
                            Rechazar
                          </button>
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