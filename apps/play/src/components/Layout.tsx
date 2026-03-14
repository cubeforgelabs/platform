import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { UserMenu } from '@cubeforgelabs/ui'
import { ThemeToggle } from './ThemeToggle'

export function Layout() {
  const { pathname } = useLocation()
  const { user, profile, signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-mono font-semibold text-sm text-text tracking-wide">
              <img src="/favicon-96x96.png" alt="CubeForge" className="h-7 w-7 rounded-md" />
              play
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/" active={pathname === '/'}>Home</NavLink>
              <NavLink to="/browse" active={pathname === '/browse'}>Browse</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="https://editor.cubeforge.dev" className="text-xs text-text-dim hover:text-text transition-colors hidden sm:block">
              Make a Game
            </a>
            {user ? (
              <UserMenu
                avatarUrl={profile?.avatar_url}
                displayName={profile?.display_name}
                username={profile?.username}
                email={user.email}
                onSignOut={signOut}
                variant="navbar"
              />
            ) : (
              <a
                href="https://account.cubeforge.dev/signin?redirect_to=https://play.cubeforge.dev"
                className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-bg hover:bg-accent2 transition-colors"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} CubeForge. Open source under MIT.
          </p>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <a href="https://cubeforge.dev" className="hover:text-text-dim transition-colors">cubeforge.dev</a>
            <a href="https://docs.cubeforge.dev" className="hover:text-text-dim transition-colors">Docs</a>
            <a href="https://github.com/1homsi/cubeforge" className="hover:text-text-dim transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-surface2 text-text' : 'text-text-dim hover:text-text hover:bg-surface'
      }`}
    >
      {children}
    </Link>
  )
}
