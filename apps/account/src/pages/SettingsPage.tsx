import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

function getProvider(user: ReturnType<typeof useAuth>['user']) {
  if (!user) return null
  const provider = user.app_metadata?.provider as string | undefined
  if (provider && provider !== 'email') return provider
  const identity = user.identities?.find(i => i.provider !== 'email')
  return identity?.provider ?? null
}

const PROVIDER_LABELS: Record<string, string> = {
  github: 'GitHub',
  google: 'Google',
}

export function SettingsPage() {
  const { user, signOut, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  // Password
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // Email change
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailSaving, setEmailSaving] = useState(false)

  // Export
  const [exporting, setExporting] = useState(false)

  // Privacy
  const [isPublic, setIsPublic] = useState(true)
  const [showFavorites, setShowFavorites] = useState(true)
  const [privacySaving, setPrivacySaving] = useState(false)
  const [privacySaved, setPrivacySaved] = useState(false)

  const oauthProvider = getProvider(user)

  useEffect(() => {
    if (profile) {
      setIsPublic(profile.is_public)
      setShowFavorites(profile.show_favorites)
    }
  }, [profile])

  async function savePrivacy() {
    if (!user) return
    setPrivacySaving(true)
    await supabase.from('profiles').update({ is_public: isPublic, show_favorites: showFavorites }).eq('id', user.id)
    await refreshProfile()
    setPrivacySaving(false)
    setPrivacySaved(true)
    setTimeout(() => setPrivacySaved(false), 3000)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPw) { setPwError('Passwords do not match'); return }
    setSaving(true)
    setPwError('')
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) { setPwError(error.message); return }
    setPwSuccess(true)
    setPassword('')
    setConfirmPw('')
    setTimeout(() => setPwSuccess(false), 4000)
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail || newEmail === user?.email) {
      setEmailError('Enter a different email address')
      return
    }
    setEmailSaving(true)
    setEmailError('')
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailSaving(false)
    if (error) { setEmailError(error.message); return }
    setEmailSent(true)
    setNewEmail('')
  }

  async function handleExport() {
    if (!user) return
    setExporting(true)
    const [profileRes, reviewsRes, historyRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('reviews').select('*, games(title)').eq('user_id', user.id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from('play_history').select('game_id, played_at, games(title)').eq('user_id', user.id),
    ])
    const payload = {
      exported_at: new Date().toISOString(),
      profile: profileRes.data,
      reviews: reviewsRes.data ?? [],
      play_history: historyRes.data ?? [],
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cubeforge-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  async function handleDeleteAccount() {
    if (!window.confirm('This will permanently delete your account and all your games. Are you sure?')) return
    await signOut()
    navigate('/signin')
  }

  const sectionStyle = { background: 'var(--surface)', border: '1px solid var(--border)' }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Settings</h1>
        <p className="text-xs text-text-muted mt-1">{user?.email}</p>
      </div>

      {/* Connected account / Password */}
      <section className="rounded-2xl flex flex-col gap-4 p-5" style={sectionStyle}>
        {oauthProvider ? (
          <>
            <h2 className="text-sm font-semibold text-text">Connected account</h2>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
              >
                {oauthProvider === 'github' ? <GithubIcon /> : <GoogleIcon />}
              </div>
              <div>
                <p className="text-sm text-text">Signed in with {PROVIDER_LABELS[oauthProvider] ?? oauthProvider}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Your password is managed by {PROVIDER_LABELS[oauthProvider] ?? oauthProvider}.
                  To change it, visit your {PROVIDER_LABELS[oauthProvider] ?? oauthProvider} account settings.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-text">Change password</h2>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="inner-input pr-11"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dim transition-colors"
                  tabIndex={-1}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  required
                  className="inner-input pr-11"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dim transition-colors"
                  tabIndex={-1}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwError && <p className="text-xs" style={{ color: 'var(--error)' }}>{pwError}</p>}
              {pwSuccess && <p className="text-xs" style={{ color: 'var(--ok)' }}>Password updated successfully.</p>}
              <button
                type="submit"
                disabled={saving}
                className="self-start rounded-xl px-5 py-2 text-sm font-semibold text-bg transition-colors disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {saving ? 'Saving…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </section>

      {/* Email address */}
      <section className="rounded-2xl flex flex-col gap-4 p-5" style={sectionStyle}>
        <h2 className="text-sm font-semibold text-text">Email address</h2>
        <p className="text-xs text-text-muted -mt-2">Current: <span className="text-text-dim">{user?.email}</span></p>
        {emailSent ? (
          <p className="text-xs" style={{ color: 'var(--ok)' }}>
            Confirmation sent to <strong>{newEmail || 'your new email'}</strong>. Click the link there to complete the change.
          </p>
        ) : (
          <form onSubmit={handleEmailChange} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              required
              className="inner-input"
            />
            {emailError && <p className="text-xs" style={{ color: 'var(--error)' }}>{emailError}</p>}
            <button
              type="submit"
              disabled={emailSaving}
              className="self-start rounded-xl px-5 py-2 text-sm font-semibold text-bg transition-colors disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {emailSaving ? 'Sending…' : 'Change email'}
            </button>
          </form>
        )}
      </section>

      {/* Privacy */}
      <section className="rounded-2xl flex flex-col gap-4 p-5" style={sectionStyle}>
        <h2 className="text-sm font-semibold text-text">Privacy</h2>
        <ToggleRow
          label="Public profile"
          description="Anyone can view your profile page on play.cubeforge.dev"
          checked={isPublic}
          onChange={setIsPublic}
        />
        <ToggleRow
          label="Show favorites"
          description="Display your favorited games on your public profile"
          checked={showFavorites}
          onChange={setShowFavorites}
        />
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={savePrivacy}
            disabled={privacySaving}
            className="rounded-xl px-5 py-2 text-sm font-semibold text-bg transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {privacySaving ? 'Saving…' : 'Save privacy'}
          </button>
          {privacySaved && <span className="text-xs" style={{ color: 'var(--ok)' }}>Saved</span>}
        </div>
      </section>

      {/* Export data */}
      <section className="rounded-2xl flex flex-col gap-4 p-5" style={sectionStyle}>
        <h2 className="text-sm font-semibold text-text">Export my data</h2>
        <p className="text-xs text-text-muted -mt-2">
          Download a copy of your profile, reviews, and play history as JSON.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="self-start rounded-xl px-5 py-2 text-sm font-semibold text-bg transition-colors disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {exporting ? 'Preparing…' : 'Download data'}
        </button>
      </section>

      {/* Danger zone */}
      <section
        className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--error)' }}>Danger zone</h2>
        <p className="text-xs text-text-dim">Deleting your account is permanent and cannot be undone.</p>
        <button
          onClick={handleDeleteAccount}
          className="self-start rounded-xl px-5 py-2 text-sm transition-colors"
          style={{ color: 'var(--error)', border: '1px solid color-mix(in srgb, var(--error) 25%, transparent)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--error) 8%, transparent)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Delete account
        </button>
      </section>
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-text">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors mt-0.5 overflow-hidden ${checked ? 'bg-accent' : 'bg-surface2'}`}
        style={{ border: '1px solid var(--border)' }}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-text">
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
