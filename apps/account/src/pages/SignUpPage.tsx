import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signUpWithEmail, signInWithOAuth } from '@cubeforgelabs/auth'

export function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
        <Atmosphere />
        <div className="text-center max-w-sm relative z-10 fade-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: 'rgba(166,227,161,0.1)',
              border: '1px solid rgba(166,227,161,0.25)',
              boxShadow: '0 0 24px rgba(166,227,161,0.15)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="#a6e3a1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">Check your email</h2>
          <p className="text-sm text-text-dim leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="text-text font-medium">{email}</span>.
            Click it to activate your account.
          </p>
          <Link
            to="/signin"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      <Atmosphere />

      <div className="w-full max-w-[360px] relative z-10 fade-up">
        <div className="text-center mb-7">
          <a href="https://cubeforge.dev" className="inline-flex flex-col items-center gap-2.5 group">
            <CubeLogo />
            <span className="text-base font-semibold text-text tracking-tight group-hover:text-accent transition-colors">
              CubeForge
            </span>
          </a>
          <h1 className="text-xl font-semibold text-text mt-4">Create an account</h1>
          <p className="text-sm text-text-dim mt-1">Build and share your games</p>
        </div>

        <div className="rounded-2xl p-6 flex flex-col gap-4" style={cardStyle}>
          <div className="flex flex-col gap-2">
            <OAuthBtn onClick={() => signInWithOAuth('github')}>
              <GithubIcon /> Continue with GitHub
            </OAuthBtn>
            <OAuthBtn onClick={() => signInWithOAuth('google')}>
              <GoogleIcon /> Continue with Google
            </OAuthBtn>
          </div>

          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-text-muted">or continue with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password — min 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
              className="auth-input"
            />

            {error && (
              <div
                className="rounded-lg px-3 py-2.5 text-xs text-red"
                style={{ background: 'rgba(243,139,168,0.08)', border: '1px solid rgba(243,139,168,0.2)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl py-2.5 text-sm font-semibold text-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4fc3f7', boxShadow: '0 0 20px rgba(79,195,247,0.2)' }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(79,195,247,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(79,195,247,0.2)' }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link to="/signin" className="text-accent hover:text-accent2 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(13, 15, 23, 0.85)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
}

function Atmosphere() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div style={{
        position: 'absolute', top: '-15%', right: '-5%',
        width: '55vw', height: '55vw',
        background: 'radial-gradient(circle, rgba(79,195,247,0.07) 0%, transparent 65%)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: '45vw', height: '45vw',
        background: 'radial-gradient(circle, rgba(79,195,247,0.04) 0%, transparent 65%)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
    </div>
  )
}

function OAuthBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-text transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.07)'
        el.style.borderColor = 'rgba(255,255,255,0.15)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = 'rgba(255,255,255,0.04)'
        el.style.borderColor = 'rgba(255,255,255,0.09)'
      }}
    >
      {children}
    </button>
  )
}

function CubeLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="38" rx="10" fill="rgba(79,195,247,0.1)" />
      <polygon points="19,8 30,14 30,26 19,32 8,26 8,14" fill="none" stroke="rgba(79,195,247,0.2)" strokeWidth="1" />
      <polygon points="19,8 30,14 19,20 8,14" fill="rgba(79,195,247,0.18)" stroke="rgba(79,195,247,0.55)" strokeWidth="1.3" />
      <polygon points="8,14 19,20 19,32 8,26" fill="rgba(79,195,247,0.07)" stroke="rgba(79,195,247,0.35)" strokeWidth="1.3" />
      <polygon points="30,14 19,20 19,32 30,26" fill="rgba(79,195,247,0.1)" stroke="rgba(79,195,247,0.4)" strokeWidth="1.3" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
