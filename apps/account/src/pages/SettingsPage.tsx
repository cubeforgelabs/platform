import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

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
  }

  async function handleDeleteAccount() {
    if (!window.confirm('This will permanently delete your account and all your games. Are you sure?')) return
    // Sign out — full account deletion requires a server function, flag for now
    await signOut()
    navigate('/signin')
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-text mb-1">Settings</h1>
        <p className="text-xs text-text-muted">{user?.email}</p>
      </div>

      {/* Change password — only for email/password users */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Change password</h2>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
            className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
            className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40"
          />
          {pwError && <p className="text-xs text-red">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-green">Password updated.</p>}
          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent2 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="border border-red/20 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-red">Danger zone</h2>
        <p className="text-xs text-text-dim">Deleting your account is permanent and cannot be undone.</p>
        <button
          onClick={handleDeleteAccount}
          className="self-start rounded-xl border border-red/30 px-5 py-2 text-sm text-red hover:bg-red/10 transition-colors"
        >
          Delete account
        </button>
      </section>
    </div>
  )
}
