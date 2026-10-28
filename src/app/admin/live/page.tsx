'use client'

import { useState, useEffect } from 'react'
import {
  Radio,
  Play,
  Eye,
  Globe,
  Clock,
  Layers,
  Flame,
  Activity,
  ShieldAlert,
} from 'lucide-react'

interface ActiveSession {
  id: string
  userId: string
  currentPage: string | null
  currentLesson: string | null
  lastSeen: string
  ip: string | null
  userAgent: string | null
  user: {
    id: string
    name: string
    email: string
    role: string
    isBanned: boolean
    registeredIp: string | null
  }
}

interface ActivityLogItem {
  id: string
  action: string
  page: string | null
  createdAt: string
  ip: string | null
  user: {
    id: string
    name: string
    email: string
    role: string
    phone?: string | null
    isBanned?: boolean
    registeredIp?: string | null
  }
  lesson: {
    id: string
    title: string
  } | null
}

export default function LiveActivityPage() {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<ActivityLogItem[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeTab, setActiveTab] = useState<'live' | 'security'>('live')

  const fetchLiveMetrics = async () => {
    try {
      const res = await fetch('/api/admin/live')
      if (res.ok) {
        const data = await res.json()
        setActiveSessions(data.activeUsers || [])
        setLogs(data.recentLogs || [])
        setSecurityAlerts(data.securityAlerts || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLiveMetrics()
    if (!autoRefresh) return
    const interval = setInterval(fetchLiveMetrics, 3500)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const actionBadge = (action: string) => {
    if (action.startsWith('SECURITY_'))
      return 'bg-red-50 text-red-600 border border-red-200'
    if (action === 'VIDEO_PLAY')
      return 'bg-[#fff4ef] text-[#e25822] border border-[#fcd5c3]'
    if (action === 'LOGIN')
      return 'bg-purple-50 text-purple-700 border border-purple-200'
    if (action === 'VIDEO_COMPLETE')
      return 'bg-green-50 text-green-700 border border-green-200'
    return 'bg-blue-50 text-blue-700 border border-blue-200'
  }

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase block">
            TELEMETRÍA EN DIRECTO
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e25822] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e25822]" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f]">
              Live Activity Monitor
            </h1>
          </div>
          <p className="text-[#86868b] text-[13px] mt-1">
            Rastreo en tiempo real: alumnos conectados, páginas activas, videos en reproducción y alertas de seguridad.
          </p>
        </div>

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
            autoRefresh
              ? 'bg-[#fffaf8] border-[#fcd5c3] text-[#e25822]'
              : 'bg-white border-[#e5e5ea] text-[#86868b]'
          }`}
        >
          <Radio size={14} className={autoRefresh ? 'animate-pulse' : ''} />
          {autoRefresh ? 'En vivo (3.5s)' : 'Pausado'}
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-[#f0f0f4] rounded-xl">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'live' ? 'bg-white text-[#e25822] shadow-sm' : 'text-[#6e6e73] hover:text-[#111]'
          }`}
        >
          <Activity size={12} />
          Actividad en Vivo
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-[#6e6e73] hover:text-[#111]'
          }`}
        >
          <ShieldAlert size={12} />
          Alertas de Seguridad
          {securityAlerts.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
              {securityAlerts.length > 9 ? '9+' : securityAlerts.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'live' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Connected Sessions (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#1d1d1f] flex items-center gap-2">
                <Flame size={17} className="text-[#e25822]" />
                Alumnos Conectados ({activeSessions.length})
              </h2>
              <span className="text-[11px] text-[#86868b]">Ping últimos 3 min</span>
            </div>

            {activeSessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-[#ededf0] text-center text-[#86868b] space-y-3 shadow-sm">
                <Activity size={32} className="mx-auto text-[#ccc]" />
                <p className="text-[13px]">No hay alumnos activos en este momento.</p>
                <p className="text-[11px] text-[#999]">
                  Abre otra pestaña con una cuenta de alumno para ver el monitoreo instantáneo.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl p-5 border border-[#ededf0] shadow-sm space-y-3.5 hover:border-[#fcd5c3] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#fff4ef] border border-[#fcd5c3] text-[#e25822] font-bold text-xs flex items-center justify-center shrink-0">
                          {session.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#1d1d1f] text-[13px] leading-tight">
                            {session.user.name}
                          </p>
                          <p className="text-[11px] text-[#86868b] font-mono truncate max-w-[140px]">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                        ONLINE
                      </span>
                    </div>

                    {session.currentLesson ? (
                      <div className="bg-[#fffaf8] border border-[#fcd5c3] rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#e25822]">
                          <Play size={11} className="fill-[#e25822] animate-pulse" />
                          <span>REPRODUCIENDO VIDEO</span>
                        </div>
                        <p className="text-xs text-[#1d1d1f] font-semibold line-clamp-1">
                          {session.currentLesson}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-[#fbfbfd] border border-[#ededf0] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#86868b]">
                          <Eye size={12} className="text-[#007aff]" />
                          <span>Navegando en plataforma</span>
                        </div>
                        <p className="text-xs text-[#333] font-mono mt-0.5">
                          {session.currentPage || '/dashboard'}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#f4f4f7] flex items-center justify-between text-[11px] text-[#86868b]">
                      <span className="flex items-center gap-1 font-mono">
                        <Globe size={11} className="text-[#e25822]" />
                        {session.ip || '127.0.0.1'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Activo ahora
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Feed (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#1d1d1f] flex items-center gap-2">
                <Layers size={17} className="text-[#e25822]" />
                Feed de Eventos
              </h2>
              <span className="text-[11px] text-[#86868b]">Últimos 25</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm space-y-2.5 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-[#86868b] text-center py-8">Sin registros recientes.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#fbfbfd] border border-[#f0f0f4] space-y-1.5 text-xs hover:border-[#fcd5c3] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1d1d1f] truncate max-w-[150px]">{log.user.name}</span>
                      <span className="text-[10px] text-[#999]">
                        {new Date(log.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${actionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-[#666] truncate text-[11px]">
                        {log.lesson ? log.lesson.title : log.page || 'Plataforma'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#999] pt-1 border-t border-[#f0f0f4] font-mono">
                      <span>IP: {log.ip || '127.0.0.1'}</span>
                      <span>{log.user.role}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <ShieldAlert size={20} className="text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">Alertas de Seguridad</p>
              <p className="text-xs text-red-500">
                Intentos de grabación, captura de pantalla, DevTools o acciones sospechosas detectadas.
              </p>
            </div>
          </div>

          {securityAlerts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-[#ededf0] text-center text-[#86868b] shadow-sm">
              <ShieldAlert size={32} className="mx-auto text-[#ccc] mb-3" />
              <p className="text-sm">No se han detectado alertas de seguridad.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#ededf0] overflow-hidden shadow-sm">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-red-50 border-b border-red-100 text-[10px] text-red-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3">Alumno</th>
                    <th className="px-5 py-3">Alerta</th>
                    <th className="px-5 py-3">Clase</th>
                    <th className="px-5 py-3">IP</th>
                    <th className="px-5 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f4f7]">
                  {securityAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-bold text-[#1d1d1f]">{alert.user.name}</p>
                        <p className="text-[11px] text-[#86868b] font-mono">{alert.user.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${actionBadge(alert.action)}`}>
                          {alert.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#555]">
                        {alert.lesson?.title || alert.page || '–'}
                      </td>
                      <td className="px-5 py-3 font-mono text-[#555]">
                        {alert.ip || '–'}
                      </td>
                      <td className="px-5 py-3 text-[#86868b]">
                        {new Date(alert.createdAt).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
