import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { useRef, useState, useEffect } from 'react'
import { Camera, Check, Globe, Calendar, Loader2, Pencil, X, ExternalLink } from 'lucide-react'

export function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [stats, setStats] = useState({ plays: 0, followers: 0, following: 0 })

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('games').select('plays').eq('author_id', user.id).not('bundle_path', 'is', null),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    ]).then(([gamesRes, followersRes, followingRes]) => {
      const plays = (gamesRes.data ?? []).reduce((s, g) => s + (g.plays ?? 0), 0)
      setStats({ plays, followers: followersRes.count ?? 0, following: followingRes.count ?? 0 })
    })
  }, [user])
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const avatarInputRef = useRef<HTMLInputElement>(null)

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
      .update({ display_name: displayName, username, bio, website, username_confirmed: true })
      .eq('id', user!.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    await refreshProfile()
    setEditing(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2 MB')
      return
    }

    setAvatarUploading(true)
    setAvatarError('')

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setAvatarError(uploadError.message)
      setAvatarUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`

    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    await refreshProfile()
    setAvatarUploading(false)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  if (!profile) return null

  const name = profile.display_name ?? profile.username
  const initials = name[0]?.toUpperCase() ?? '?'
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Profile</h1>
        {!editing && (
          <button
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid var(--border)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Pencil size={12} /> Edit profile
          </button>
        )}
      </div>

      {/* Identity card */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Clickable avatar */}
        <label htmlFor="avatar-upload" className="relative cursor-pointer group shrink-0" title="Change avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'rgba(79,195,247,0.12)', color: 'var(--accent)', border: '1px solid rgba(79,195,247,0.2)' }}
            >
              {initials}
            </div>
          )}
          <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {avatarUploading
              ? <Loader2 size={16} className="animate-spin text-white" />
              : <Camera size={16} className="text-white" />
            }
          </div>
          <input
            ref={avatarInputRef}
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={avatarUploading}
          />
        </label>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-text truncate">{name}</p>
            <a
              href={`https://play.cubeforge.dev/user/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-accent transition-colors"
            >
              <ExternalLink size={10} /> Public profile
            </a>
          </div>
          <p className="text-xs text-text-muted mt-0.5">@{profile.username}</p>
          <p className="text-xs text-text-muted mt-0.5 truncate">{user?.email}</p>
          <div className="flex items-center gap-1 mt-2">
            <Calendar size={11} className="text-text-muted shrink-0" />
            <span className="text-xs text-text-muted">Member since {memberSince}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 text-center">
          <div>
            <p className="text-lg font-bold text-text">{stats.plays.toLocaleString()}</p>
            <p className="text-[10px] text-text-muted">Total plays</p>
          </div>
          <div>
            <p className="text-lg font-bold text-text">{stats.followers}</p>
            <p className="text-[10px] text-text-muted">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold text-text">{stats.following}</p>
            <p className="text-[10px] text-text-muted">Following</p>
          </div>
        </div>
      </div>

      {avatarError && (
        <p className="text-xs" style={{ color: 'var(--error)' }}>{avatarError}</p>
      )}

      {/* Edit form */}
      {editing && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Display name">
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" className="inner-input" />
              </Field>
              <Field label="Username">
                <input value={username} onChange={e => setUsername(e.target.value)} required placeholder="handle" className="inner-input" />
              </Field>
            </div>
            <Field label="Bio">
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us a bit about yourself…" className="inner-input" />
            </Field>
            <Field label="Website">
              <input value={website} onChange={e => setWebsite(e.target.value)} type="url" placeholder="https://" className="inner-input" />
            </Field>
            {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50 transition-colors"
                style={{ background: 'var(--accent)' }}
              >
                <Check size={14} />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-text-dim hover:text-text transition-colors"
                style={{ border: '1px solid var(--border)' }}
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
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {profile.bio && <p className="text-sm text-text-dim leading-relaxed">{profile.bio}</p>}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs hover:underline"
              style={{ color: 'var(--accent)' }}
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
