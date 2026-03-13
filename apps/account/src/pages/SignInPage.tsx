import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail, signInWithOAuth } from '@cubeforgelabs/auth'
import { Loader2 } from 'lucide-react'
import { PhysicsBg } from '../components/PhysicsBg'

export function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signInWithEmail(email, password)
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative">
      <PhysicsBg />

      <div className="w-full max-w-[340px] relative z-10 fade-up">
        <div className="text-center mb-6">
          <a href="https://cubeforge.dev" className="inline-flex items-center gap-2 group mb-3">
            <img src="/favicon.svg" alt="" width={26} height={26} className="rounded-md" />
            <span className="text-sm font-medium text-text-dim group-hover:text-text transition-colors">CubeForge</span>
          </a>
          <h1 className="text-2xl font-semibold text-text">Welcome back</h1>
          <p className="text-sm text-text-dim mt-1">Sign in to your account</p>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'rgba(19,21,31,0.9)', backdropFilter: 'blur(12px)' }}>
          <div className="p-5 flex flex-col gap-2.5">
            <OAuthButton onClick={() => signInWithOAuth('github')}>
              <GithubLogo /> Continue with GitHub
            </OAuthButton>
            <OAuthButton onClick={() => signInWithOAuth('google')}>
              <GoogleLogo /> Continue with Google
            </OAuthButton>
          </div>

          <div className="flex items-center gap-3 px-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="p-5 pt-4 flex flex-col gap-2.5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            {error && <p className="text-xs text-red">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-bg disabled:opacity-60 mt-0.5"
              style={{ background: 'var(--accent)' }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="text-center text-xs text-text-muted pt-0.5">
              No account?{' '}
              <Link to="/signup" className="text-accent hover:text-accent2 transition-colors">Sign up free</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

function OAuthButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm text-text transition-colors"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
    >
      {children}
    </button>
  )
}

function GithubLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
