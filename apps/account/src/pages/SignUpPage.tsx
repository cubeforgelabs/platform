import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signUpWithEmail, signInWithOAuth } from '@cubeforgelabs/auth'
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { PhysicsBg } from '../components/PhysicsBg'

export function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signUpWithEmail(email, password)
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative">
        <PhysicsBg />
        <div className="text-center max-w-sm relative z-10 fade-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(166,227,161,0.1)', border: '1px solid rgba(166,227,161,0.2)' }}
          >
            <Check size={24} color="#a6e3a1" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-semibold text-text mb-2">Check your email</h2>
          <p className="text-sm text-text-dim leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-text font-medium">{email}</span>.
            Click it to activate your account.
          </p>
          <Link
            to="/signin"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10 relative">
      <PhysicsBg />

      <div className="w-full max-w-md relative z-10 fade-up">
        <div className="text-center mb-8">
          <a href="https://cubeforge.dev" className="inline-flex items-center justify-center gap-2.5 group mb-4">
            <img src="/favicon-96x96.png" alt="CubeForge" width={32} height={32} className="rounded-lg" />
            <span className="text-sm font-medium text-text-dim group-hover:text-text transition-colors">CubeForge</span>
          </a>
          <h1 className="text-3xl font-semibold text-text tracking-tight">Create an account</h1>
          <p className="text-sm text-text-dim mt-2">Build and share your games</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/90 backdrop-blur-xl overflow-hidden">
          <div className="p-6 flex flex-col gap-3">
            <OAuthButton onClick={() => signInWithOAuth('github')}>
              <GithubLogo /> Continue with GitHub
            </OAuthButton>
            <OAuthButton onClick={() => signInWithOAuth('google')}>
              <GoogleLogo /> Continue with Google
            </OAuthButton>
          </div>

          <div className="flex items-center gap-4 px-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="auth-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dim transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold text-bg disabled:opacity-60 bg-accent hover:bg-accent2 transition-colors mt-1"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-sm text-text-muted pt-1">
              Already have an account?{' '}
              <Link to="/signin" className="text-text underline hover:text-accent transition-colors">Sign in</Link>
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
      className="w-full flex items-center justify-center gap-3 rounded-lg px-4 py-4 text-sm font-medium text-text bg-white/5 hover:bg-white/10 border border-border transition-colors"
    >
      {children}
    </button>
  )
}

function GithubLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
