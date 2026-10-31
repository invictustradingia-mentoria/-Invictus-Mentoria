'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

// Modo noche / modo claro. Se guarda en este dispositivo (localStorage "inv-theme").
export function applyTheme(t: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', t)
  try { localStorage.setItem('inv-theme', t) } catch {}
  window.dispatchEvent(new Event('inv-theme'))
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  useEffect(() => {
    const read = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    read()
    window.addEventListener('inv-theme', read)
    return () => window.removeEventListener('inv-theme', read)
  }, [])
  return { theme, toggle: () => applyTheme(theme === 'dark' ? 'light' : 'dark') }
}

export default function ThemeToggle({ variant = 'row' }: { variant?: 'row' | 'icon' }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  if (variant === 'icon') {
    return (
      <button type="button" onClick={toggle} aria-label={dark ? 'Activar modo claro' : 'Activar modo noche'} title={dark ? 'Modo claro' : 'Modo noche'}
        className="rounded-lg p-1.5 text-slate-700 cursor-pointer">
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    )
  }
  return (
    <button type="button" onClick={toggle}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 cursor-pointer">
      <span className="flex items-center gap-3">{dark ? <Sun size={17} /> : <Moon size={17} />} {dark ? 'Modo claro' : 'Modo noche'}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${dark ? 'bg-sky-500' : 'bg-slate-200'}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${dark ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}
