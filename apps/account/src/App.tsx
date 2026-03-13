import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './lib/auth-context'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { ProfilePage } from './pages/ProfilePage'
import { MyGamesPage } from './pages/MyGamesPage'
import { SettingsPage } from './pages/SettingsPage'
import { SetupUsernamePage } from './pages/SetupUsernamePage'
import { Layout } from './components/Layout'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-text-dim text-sm">Loading…</div>
  if (!user) return <Navigate to="/signin" replace />
  if (profile && !profile.username_confirmed && location.pathname !== '/setup-username') {
    return <Navigate to="/setup-username" replace />
  }
  return <>{children}</>
}

export function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/setup-username" element={<RequireAuth><SetupUsernamePage /></RequireAuth>} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<ProfilePage />} />
        <Route path="games" element={<MyGamesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
