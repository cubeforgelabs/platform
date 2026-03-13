import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'

const NAV = [
  { to: '/', label: 'Profile', end: true },
  { to: '/games', label: 'My Games' },
  { to: '/settings', label: 'Settings' },
]

export function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header
        className="sticky top-0 z-10"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(11,13,20,0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="https://cubeforge.dev" className="flex items-center gap-2 group">
            <MiniCube />
            <span className="text-sm font-semibold text-text tracking-tight group-hover:text-accent transition-colors">
              CubeForge
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted hidden sm:block">
              {profile?.display_name ?? profile?.username ?? ''}
            </span>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-bg"
                style={{ background: '#4fc3f7' }}
              >
                {(profile?.display_name ?? profile?.username ?? '?')[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs text-text-muted hover:text-text transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 py-8 gap-8">
        <nav className="w-40 shrink-0 flex flex-col gap-0.5 pt-1">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'text-text font-medium'
                    : 'text-text-muted hover:text-text-dim'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(255,255,255,0.06)',
              } : {}}
            >
              {label}
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

function MiniCube() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polygon points="11,2 19,6.5 19,15.5 11,20 3,15.5 3,6.5" fill="none" stroke="rgba(79,195,247,0.3)" strokeWidth="0.8" />
      <polygon points="11,2 19,6.5 11,11 3,6.5" fill="rgba(79,195,247,0.18)" stroke="rgba(79,195,247,0.55)" strokeWidth="1" />
      <polygon points="3,6.5 11,11 11,20 3,15.5" fill="rgba(79,195,247,0.07)" stroke="rgba(79,195,247,0.3)" strokeWidth="1" />
      <polygon points="19,6.5 11,11 11,20 19,15.5" fill="rgba(79,195,247,0.1)" stroke="rgba(79,195,247,0.35)" strokeWidth="1" />
    </svg>
  )
}
