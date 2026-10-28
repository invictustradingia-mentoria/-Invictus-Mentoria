'use client'

import { useState, useEffect } from 'react'
import { Users, Shield, CheckCircle, RefreshCw, Trash2 } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (res.ok) {
        fetchUsers()
      } else {
        alert('Error al actualizar el rol')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Gestión y Control de Alumnos</h1>
          <p className="text-sm text-[#86868b]">Asigna los roles institucionales: ADMIN, CLUB o MENTORIA.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-[#ededf0] hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCw size={14} />
          Actualizar Lista
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#ededf0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ededf0] bg-[#fafafc] text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                <th className="p-4">Alumno</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Rol Institucional</th>
                <th className="p-4">IP de Registro</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ededf0] text-xs">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#fafafc] transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#1d1d1f]">{user.name || 'Sin nombre'}</p>
                    <p className="text-[11px] text-[#86868b]">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600">
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:border-[#e25822] cursor-pointer"
                    >
                      <option value="CLUB">CLUB</option>
                      <option value="MENTORIA">MENTORIA</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-gray-500">{user.registeredIp || 'N/A'}</td>
                  <td className="p-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}