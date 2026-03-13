import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import { Pencil, X, Check, Globe, Calendar } from 'lucide-react'

export function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startEditing() {
    setDisplayName(profile?.display_name ?? '')
    setUsername(profile?.username ?? '')
    setBio(profile?.bio ?? '')
    setWebsite(profile?.website ?? '')
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, username, bio, website })
      .eq('id', user!.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    await refreshProfile()
    setEditing(false)
  }

  if (!profile) return null

  const name = profile.display_name ?? profile.username
  const initials = name[0]?.toUpperCase() ?? '?'
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-lg flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Profile</h1>
        {!editing && (
          <button
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid #1f2435' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Pencil size={12} /> Edit profile
          </button>
        )}
      </div>

      {/* Identity card */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: '#13151f', border: '1px solid #1f2435' }}
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
        ) : (
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: 'rgba(79,195,247,0.12)', color: '#4fc3f7', border: '1px solid rgba(79,195,247,0.2)' }}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text truncate">{name}</p>
          <p className="text-xs text-text-muted mt-0.5">@{profile.username}</p>
          <p className="text-xs text-text-muted mt-0.5 truncate">{user?.email}</p>
          <div className="flex items-center gap-1 mt-2">
            <Calendar size={11} className="text-text-muted shrink-0" />
            <span className="text-xs text-text-muted">Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div
          className="rounded-2xl p-5"
          style={{ background: '#13151f', border: '1px solid #2a3048' }}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Display name">
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="inner-input"
                />
              </Field>
              <Field label="Username">
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="handle"
                  className="inner-input"
                />
              </Field>
            </div>
            <Field label="Bio">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us a bit about yourself…"
                className="inner-input"
              />
            </Field>
            <Field label="Website">
              <input
                value={website}
                onChange={e => setWebsite(e.target.value)}
                type="url"
                placeholder="https://"
                className="inner-input"
              />
            </Field>
            {error && <p className="text-xs" style={{ color: '#f38ba8' }}>{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50 transition-colors"
                style={{ background: '#4fc3f7' }}
              >
                <Check size={14} />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-text-dim hover:text-text transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bio & website when not editing */}
      {!editing && (profile.bio || profile.website) && (
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: '#13151f', border: '1px solid #1f2435' }}
        >
          {profile.bio && (
            <p className="text-sm text-text-dim leading-relaxed">{profile.bio}</p>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs hover:underline"
              style={{ color: '#4fc3f7' }}
            >
              <Globe size={12} />
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-dim">{label}</label>
      {children}
    </div>
  )
}
