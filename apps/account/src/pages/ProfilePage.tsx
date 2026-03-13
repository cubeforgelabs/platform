import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [username, setUsername] = useState(profile?.username ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [website, setWebsite] = useState(profile?.website ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text">Profile</h1>
        {!editing && (
          <button
            onClick={() => {
              setDisplayName(profile.display_name ?? '')
              setUsername(profile.username)
              setBio(profile.bio ?? '')
              setWebsite(profile.website ?? '')
              setEditing(true)
            }}
            className="text-xs text-accent hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-surface2 border border-border flex items-center justify-center text-2xl font-bold text-accent">
            {(profile.display_name ?? profile.username)[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-text">{profile.display_name ?? profile.username}</p>
          <p className="text-xs text-text-muted">@{profile.username}</p>
          <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <Field label="Display name">
            <input value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40" />
          </Field>
          <Field label="Username">
            <input value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40" />
          </Field>
          <Field label="Bio">
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40 resize-none" />
          </Field>
          <Field label="Website">
            <input value={website} onChange={e => setWebsite(e.target.value)} type="url" placeholder="https://"
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/40" />
          </Field>
          {error && <p className="text-xs text-red">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent2 transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="rounded-xl border border-border px-5 py-2 text-sm text-text-dim hover:text-text transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          {profile.bio && (
            <div className="rounded-xl bg-surface2 border border-border px-4 py-3">
              <p className="text-sm text-text-dim">{profile.bio}</p>
            </div>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="text-xs text-accent hover:underline">
              {profile.website}
            </a>
          )}
          <p className="text-xs text-text-muted">
            Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-text-muted">{label}</label>
      {children}
    </div>
  )
}
