import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { UserMenu } from '@cubeforgelabs/ui'
import { ThemeToggle } from './ThemeToggle'
import { Bell } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Profile', end: true },
  { to: '/games', label: 'My Games' },
  { to: '/history', label: 'History' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/follows', label: 'Following' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/settings', label: 'Settings' },
]

export function Layout() {
  const { profile, signOut, user } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    async function fetchUnread() {
      const { count } = await (supabase as any)
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('read', false)
      setUnreadCount(count ?? 0)
    }
    fetchUnread()
  }, [user])

  async function handleSignOut() {
    await signOut()
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header
        className="sticky top-0 z-10"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="https://cubeforge.dev" className="flex items-center gap-2 group">
            <img src="/favicon-96x96.png" alt="CubeForge" width={22} height={22} style={{ borderRadius: 4 }} />
            <span className="text-sm font-semibold text-text tracking-tight group-hover:text-accent transition-colors">
              CubeForge
            </span>
          </a>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu
              avatarUrl={profile?.avatar_url}
              displayName={profile?.display_name}
              username={profile?.username}
              onSignOut={handleSignOut}
              variant="navbar"
              showAccountLink={false}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-8 gap-8">
        <nav className="w-40 shrink-0 flex flex-col gap-0.5 pt-1">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'text-text font-medium'
                    : 'text-text-muted hover:text-text-dim'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'var(--surface2)',
              } : {}}
            >
              {label === 'Notifications' ? (
                <>
                  <Bell size={13} className="shrink-0" />
                  <span>{label}</span>
                  {unreadCount > 0 && (
                    <span
                      className="ml-auto text-[9px] font-bold rounded-full px-1.5 py-0.5"
                      style={{ background: 'var(--error)', color: '#fff' }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              ) : label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

