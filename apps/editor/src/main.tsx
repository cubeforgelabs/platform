import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth-context'
import { App } from './App'
import { DashboardPage } from './pages/DashboardPage'
import './styles.css'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-dim)', fontSize: 13, fontFamily: 'var(--font)' }}>
      Loading…
    </div>
  )
  if (!user) {
    window.location.href = `https://account.cubeforge.dev/signin?redirect_to=${encodeURIComponent(window.location.href)}`
    return null
  }
  if (profile && !profile.username_confirmed) {
    window.location.href = 'https://account.cubeforge.dev/setup-username'
    return null
  }
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/project/:projectId" element={<RequireAuth><App /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
