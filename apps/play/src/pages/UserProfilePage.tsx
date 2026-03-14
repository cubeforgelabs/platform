import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { GameCard } from '../components/GameCard'
import type { Tables } from '@cubeforgelabs/auth'
import type { GameListItem } from '../lib/api'

type Profile = Tables<'profiles'>

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [games, setGames] = useState<GameListItem[]>([])
  const [favorites, setFavorites] = useState<GameListItem[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [tab, setTab] = useState<'games' | 'favorites'>('games')

  const isOwnProfile = user && profile && user.id === profile.id

  useEffect(() => {
    if (!username) return
    loadProfile()
  }, [username])

  useEffect(() => {
    if (!profile || !user) return
    supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .maybeSingle()
      .then(({ data }) => setIsFollowing(!!data))
  }, [profile, user])

  async function loadProfile() {
    setLoading(true)
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username!)
      .single()

    if (!p) { setLoading(false); return }
    setProfile(p)

    await Promise.all([
      // Games they uploaded
      supabase
        .from('games')
        .select('*, profiles!games_author_id_fkey(username, display_name, avatar_url)')
        .eq('author_id', p.id)
        .not('bundle_path', 'is', null)
        .order('plays', { ascending: false })
        .then(({ data }) => setGames((data as unknown as GameListItem[]) ?? [])),

      // Favorited games (if allowed)
      p.show_favorites
        ? supabase
            .from('favorites')
            .select('game_id, games(*, profiles!games_author_id_fkey(username, display_name, avatar_url))')
            .eq('user_id', p.id)
            .then(({ data }) => {
              const favGames = (data ?? []).map((f: any) => f.games).filter(Boolean)
              setFavorites(favGames as unknown as GameListItem[])
            })
        : Promise.resolve(),

      // Follower/following counts
      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', p.id)
        .then(({ count }) => setFollowerCount(count ?? 0)),

      supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', p.id)
        .then(({ count }) => setFollowingCount(count ?? 0)),
    ])

    setLoading(false)
  }

  async function toggleFollow() {
    if (!user || !profile) return
    setFollowLoading(true)
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id)
      setIsFollowing(false)
      setFollowerCount(c => c - 1)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id })
      setIsFollowing(true)
      setFollowerCount(c => c + 1)
    }
    setFollowLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center py-40 text-sm text-text-dim">Loading…</div>

  if (!profile) return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-text mb-4">User not found</h1>
      <Link to="/" className="text-sm text-accent hover:text-accent2">Back to home</Link>
    </div>
  )

  if (!profile.is_public && !isOwnProfile) return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-surface2 border border-border flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-text-muted">
        {profile.username[0].toUpperCase()}
      </div>
      <h1 className="text-lg font-semibold text-text mb-2">@{profile.username}</h1>
      <p className="text-sm text-text-dim">This profile is private.</p>
    </div>
  )

  const displayName = profile.display_name ?? profile.username
  const showFavTab = profile.show_favorites && favorites.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
        {/* Avatar */}
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-border shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-surface2 border-2 border-border flex items-center justify-center text-3xl font-bold text-accent shrink-0">
            {displayName[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-text">{displayName}</h1>
            {!isOwnProfile && user && (
              <button
                onClick={toggleFollow}
                disabled={followLoading}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                  isFollowing
                    ? 'border border-border bg-surface2 text-text-dim hover:border-error/40 hover:text-error'
                    : 'bg-accent text-bg hover:bg-accent2'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {!user && (
              <a
                href={`https://account.cubeforge.dev/signin?redirect_to=https://play.cubeforge.dev/user/${profile.username}`}
                className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-bg hover:bg-accent2 transition-colors"
              >
                Follow
              </a>
            )}
          </div>
          <p className="text-sm text-text-muted mb-2">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-text-dim leading-relaxed mb-2 max-w-lg">{profile.bio}</p>}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="text-xs text-accent hover:underline">
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 shrink-0">
          <Stat label="Games" value={games.length} />
          <Stat label="Followers" value={followerCount} />
          <Stat label="Following" value={followingCount} />
        </div>
      </div>

      {/* Tabs */}
      {showFavTab && (
        <div className="flex items-center gap-1 border-b border-border mb-6">
          <TabBtn active={tab === 'games'} onClick={() => setTab('games')}>
            Games {games.length > 0 && <span className="text-text-muted font-normal ml-1">({games.length})</span>}
          </TabBtn>
          <TabBtn active={tab === 'favorites'} onClick={() => setTab('favorites')}>
            Favorites {favorites.length > 0 && <span className="text-text-muted font-normal ml-1">({favorites.length})</span>}
          </TabBtn>
        </div>
      )}

      {/* Content */}
      {(tab === 'games' || !showFavTab) && (
        games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {games.map(g => <GameCard key={g.id} game={g} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-sm text-text-muted">No games published yet.</div>
        )
      )}

      {tab === 'favorites' && showFavTab && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map(g => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-text">{value.toLocaleString()}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-dim'
      }`}
    >
      {children}
    </button>
  )
}
