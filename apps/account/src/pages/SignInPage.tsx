import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithEmail, signInWithOAuth, getSupabaseClient } from '@cubeforgelabs/auth'
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { PhysicsBg } from '../components/PhysicsBg'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Separator } from '../components/ui/separator'

type View = 'signin' | 'forgot' | 'forgot-sent'

export function SignInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect_to')
  const [view, setView] = useState<View>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signInWithEmail(email, password)
    setLoading(false)
    if (error) { setError(error.message); return }
    if (redirectTo) { window.location.href = redirectTo; return }
    navigate('/')
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setView('forgot-sent')
  }

  const subtitle = view === 'signin'
    ? 'Sign in to your account'
    : view === 'forgot'
    ? 'Enter your email to reset your password'
    : 'Check your email'

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10 relative">
      <PhysicsBg />

      <div className="w-full max-w-[400px] relative z-10 fade-up">
        <div className="text-center mb-8">
          <a href="https://cubeforge.dev" className="inline-flex items-center justify-center gap-2.5 group mb-5">
            <img src="/favicon-96x96.png" alt="CubeForge" width={36} height={36} className="rounded-lg" />
            <span className="text-sm font-semibold text-text-dim group-hover:text-text transition-colors">CubeForge</span>
          </a>
          <h1 className="text-2xl font-semibold text-text tracking-tight">
            {view === 'signin' ? 'Welcome back' : view === 'forgot' ? 'Reset password' : 'Email sent'}
          </h1>
          <p className="text-sm text-text-dim mt-1.5">{subtitle}</p>
        </div>

        <Card>
          {/* ── Forgot sent confirmation ── */}
          {view === 'forgot-sent' && (
            <CardContent className="px-6 py-8 flex flex-col items-center gap-4 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.2)' }}
              >
                <Mail size={20} color="#4fc3f7" />
              </div>
              <p className="text-sm text-text-dim leading-relaxed">
                We sent a reset link to <span className="text-text font-medium">{email}</span>.
                Check your inbox and follow the link to set a new password.
              </p>
              <button
                onClick={() => { setView('signin'); setError('') }}
                className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mt-1"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
            </CardContent>
          )}

          {/* ── Forgot password form ── */}
          {view === 'forgot' && (
            <CardContent className="px-6 py-6 flex flex-col gap-4">
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm" style={{ color: '#f38ba8' }}>{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
              <button
                onClick={() => { setView('signin'); setError('') }}
                className="inline-flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
            </CardContent>
          )}

          {/* ── Sign in form ── */}
          {view === 'signin' && (
            <>
              <CardHeader className="px-6 pt-6 pb-5">
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full py-3" onClick={() => signInWithOAuth('github', redirectTo ?? undefined)}>
                    <GithubLogo /> Continue with GitHub
                  </Button>
                  <Button variant="outline" className="w-full py-3" onClick={() => signInWithOAuth('google', redirectTo ?? undefined)}>
                    <GoogleLogo /> Continue with Google
                  </Button>
                </div>
              </CardHeader>

              <div className="flex items-center gap-4 px-6 pb-5">
                <Separator />
                <span className="text-xs text-text-muted shrink-0">or</span>
                <Separator />
              </div>

              <CardContent className="px-6 pt-0 pb-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setError('') }}
                        className="text-xs text-text-muted hover:text-text-dim transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="pr-11"
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

                  {error && <p className="text-sm" style={{ color: '#f38ba8' }}>{error}</p>}

                  <Button type="submit" className="w-full mt-1" disabled={loading}>
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {loading ? 'Signing in…' : 'Sign in'}
                  </Button>

                  <p className="text-center text-sm text-text-muted pt-1">
                    Don't have an account?{' '}
                    <Link to={redirectTo ? `/signup?redirect_to=${encodeURIComponent(redirectTo)}` : '/signup'} className="text-text underline hover:text-accent transition-colors">
                      Sign up
                    </Link>
                  </p>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

function GithubLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
