import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('cf-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    const theme = next ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cf-theme', theme)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-full px-1 py-1 transition-colors"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {/* Sun */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ color: dark ? 'var(--text-muted)' : 'var(--accent)', transition: 'color 0.2s' }}>
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      {/* Pill */}
      <div className="relative w-8 h-4 rounded-full transition-colors"
        style={{ background: dark ? 'var(--accent)' : 'var(--border2)' }}>
        <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200"
          style={{ transform: dark ? 'translateX(18px)' : 'translateX(2px)' }} />
      </div>
      {/* Moon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ color: dark ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s' }}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  )
}
