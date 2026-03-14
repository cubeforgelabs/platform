import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

type ProfileSnippet = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

type FollowingRow = {
  following_id: string
  created_at: string | null
  profiles: ProfileSnippet | null
}

type FollowerRow = {
  follower_id: string
  created_at: string | null
  profiles: ProfileSnippet | null
}

export function FollowsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'following' | 'followers'>('following')
  const [following, setFollowing] = useState<FollowingRow[]>([])
  const [followers, setFollowers] = useState<FollowerRow[]>([])
  const [loading, setLoading] = useState(true)

  async function loadFollows() {
    if (!user) return
    const [followingRes, followersRes] = await Promise.all([
      supabase
        .from('follows')
        .select('following_id, created_at, profiles!follows_following_id_fkey(id, username, display_name, avatar_url)')
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('follows')
        .select('follower_id, created_at, profiles!follows_follower_id_fkey(id, username, display_name, avatar_url)')
        .eq('following_id', user.id)
        .order('created_at', { ascending: false }),
    ])
    setFollowing((followingRes.data as unknown as FollowingRow[]) ?? [])
    setFollowers((followersRes.data as unknown as FollowerRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadFollows() }, [user])

  async function unfollow(followingId: string) {
    if (!user) return
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', followingId)
    setFollowing(f => f.filter(x => x.following_id !== followingId))
  }

  if (loading) return <div className="text-sm text-text-dim">Loading…</div>

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Following</h1>
        <p className="text-xs text-text-muted mt-1">Manage your social connections</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
        {(['following', 'followers'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors"
            style={
              tab === t
                ? { background: 'var(--surface2)', color: 'var(--text)' }
                : { color: 'var(--text-muted)' }
            }
          >
            {t === 'following'
              ? `Following (${following.length})`
              : `Followers (${followers.length})`}
          </button>
        ))}
      </div>

      {tab === 'following' && (
        following.length === 0 ? (
          <EmptyState message="You're not following anyone yet." cta="Discover players" />
        ) : (
          <div className="flex flex-col gap-2">
            {following.map(row => (
              <PersonRow
                key={row.following_id}
                profile={row.profiles}
                action={
                  <button
                    onClick={() => unfollow(row.following_id)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--error)'
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--error) 40%, transparent)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--text-muted)'
                      e.currentTarget.style.borderColor = 'var(--border)'
                    }}
                  >
                    Unfollow
                  </button>
                }
              />
            ))}
          </div>
        )
      )}

      {tab === 'followers' && (
        followers.length === 0 ? (
          <EmptyState message="No followers yet." />
        ) : (
          <div className="flex flex-col gap-2">
            {followers.map(row => (
              <PersonRow key={row.follower_id} profile={row.profiles} />
            ))}
          </div>
        )
      )}
    </div>
  )
}

function PersonRow({
  profile,
  action,
}: {
  profile: ProfileSnippet | null
  action?: React.ReactNode
}) {
  const name = profile?.display_name ?? profile?.username ?? 'Unknown'
  const initials = name[0]?.toUpperCase() ?? '?'

  return (
    <div
      className="flex items-center gap-3 rounded-xl p-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="w-10 h-10 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: 'rgba(79,195,247,0.12)', color: 'var(--accent)' }}
        >
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <a
          href={`https://play.cubeforge.dev/user/${profile?.username}`}
          className="text-sm font-medium transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
        >
          {name}
        </a>
        {profile?.username && (
          <p className="text-xs text-text-muted mt-0.5">@{profile.username}</p>
        )}
      </div>
      {action}
    </div>
  )
}

function EmptyState({ message, cta }: { message: string; cta?: string }) {
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-sm text-text-dim">{message}</p>
      {cta && (
        <a
          href="https://play.cubeforge.dev"
          className="text-xs mt-2 inline-block hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          {cta}
        </a>
      )}
    </div>
  )
}
