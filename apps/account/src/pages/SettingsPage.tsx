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
    await signOut()
    navigate('/signin')
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-text mb-1">Settings</h1>
        <p className="text-xs text-text-muted">{user?.email}</p>
      </div>

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
            className="inner-input"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
            className="inner-input"
          />
          {pwError && <p className="text-xs text-red">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-green">Password updated.</p>}
          <button
            type="submit"
            disabled={saving}
            className="self-start rounded-xl px-5 py-2 text-sm font-semibold text-bg transition-colors disabled:opacity-50"
            style={{ background: '#4fc3f7' }}
          >
            {saving ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </section>

      <section
        className="rounded-2xl p-5 flex flex-col gap-3"
        style={{ border: '1px solid rgba(243,139,168,0.2)' }}
      >
        <h2 className="text-sm font-semibold text-red">Danger zone</h2>
        <p className="text-xs text-text-dim">Deleting your account is permanent and cannot be undone.</p>
        <button
          onClick={handleDeleteAccount}
          className="self-start rounded-xl px-5 py-2 text-sm text-red transition-colors hover:bg-red/10"
          style={{ border: '1px solid rgba(243,139,168,0.25)' }}
        >
          Delete account
        </button>
      </section>
    </div>
  )
}
