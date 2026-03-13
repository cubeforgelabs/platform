import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

export function SetupUsernamePage() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (clean.length < 3) { setError('Username must be at least 3 characters'); return }
    if (clean !== username.trim()) { setUsername(clean); setError('Username adjusted to allowed characters'); return }

    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: clean, username_confirmed: true })
    setSaving(false)

    if (err) {
      setError(err.message.includes('unique') ? 'That username is already taken.' : err.message)
      return
    }
    await refreshProfile()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="https://cubeforge.dev" className="inline-flex items-center justify-center gap-2.5 group mb-5">
            <img src="/favicon-96x96.png" alt="CubeForge" width={36} height={36} className="rounded-lg" />
            <span className="text-sm font-semibold text-text-dim group-hover:text-text transition-colors">CubeForge</span>
          </a>
          <h1 className="text-2xl font-semibold text-text tracking-tight">Choose a username</h1>
          <p className="text-sm text-text-dim mt-1.5">This is how others will find you on CubeForge.</p>
        </div>

        <div className="rounded-2xl p-6" style={{ background: '#13151f', border: '1px solid #1f2435' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-dim">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">@</span>
                <input
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError('') }}
                  placeholder="yourhandle"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_-]+"
                  autoFocus
                  className="w-full rounded-xl border border-border bg-surface2 pl-7 pr-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent/40"
                />
              </div>
              <p className="text-[11px] text-text-muted">Letters, numbers, underscores and hyphens only.</p>
            </div>

            {error && <p className="text-xs" style={{ color: '#f38ba8' }}>{error}</p>}

            <button
              type="submit"
              disabled={saving || username.trim().length < 3}
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-bg transition-colors disabled:opacity-50"
              style={{ background: '#4fc3f7' }}
            >
              {saving ? 'Saving…' : 'Set username'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
