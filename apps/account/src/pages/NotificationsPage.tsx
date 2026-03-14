import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'

type Profile = {
  username: string
  display_name: string | null
  avatar_url: string | null
}

type Game = {
  title: string
}

type Notification = {
  id: string
  user_id: string
  type: 'new_follower' | 'new_review'
  data: {
    follower_id?: string
    reviewer_id?: string
    game_id?: string
    rating?: number
  }
  read: boolean
  created_at: string
}

type EnrichedNotification = Notification & {
  profile: Profile | null
  game: Game | null
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function Avatar({ avatarUrl, username }: { avatarUrl: string | null; username: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    )
  }
  return (
    <div
      className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold"
      style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  )
}

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<EnrichedNotification[]>([])

  useEffect(() => {
    if (!user) return

    async function load() {
      const { data: rows } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!rows || rows.length === 0) {
        setNotifications([])
        return
      }

      const enriched: EnrichedNotification[] = await Promise.all(
        (rows as Notification[]).map(async (n) => {
          let profile: Profile | null = null
          let game: Game | null = null

          if (n.type === 'new_follower' && n.data.follower_id) {
            const { data } = await supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', n.data.follower_id)
              .single()
            profile = data as Profile | null
          }

          if (n.type === 'new_review' && n.data.reviewer_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', n.data.reviewer_id)
              .single()
            profile = profileData as Profile | null

            if (n.data.game_id) {
              const { data: gameData } = await supabase
                .from('games')
                .select('title')
                .eq('id', n.data.game_id)
                .single()
              game = gameData as Game | null
            }
          }

          return { ...n, profile, game }
        })
      )

      setNotifications(enriched)

      // Mark all unread as read
      const unreadIds = (rows as Notification[])
        .filter((n) => !n.read)
        .map((n) => n.id)

      if (unreadIds.length > 0) {
        await (supabase as any)
          .from('notifications')
          .update({ read: true })
          .in('id', unreadIds)
      }
    }

    load()
  }, [user])

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Notifications</h1>
        <p className="text-xs text-text-muted mt-1">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm text-text-dim">No notifications yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const username = n.profile?.username ?? 'Someone'
            const avatarUrl = n.profile?.avatar_url ?? null

            let message: React.ReactNode = null
            let href: string = '#'

            if (n.type === 'new_follower') {
              href = `https://play.cubeforge.dev/user/${username}`
              message = (
                <>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium transition-colors"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                  >
                    {username}
                  </a>
                  <span className="text-text-dim"> started following you</span>
                </>
              )
            } else if (n.type === 'new_review') {
              const gameId = n.data.game_id ?? ''
              const gameTitle = n.game?.title ?? 'your game'
              const rating = n.data.rating ?? 0
              href = `https://play.cubeforge.dev/game/${gameId}`
              message = (
                <>
                  <a
                    href={`https://play.cubeforge.dev/user/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium transition-colors"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                  >
                    {username}
                  </a>
                  <span className="text-text-dim"> gave </span>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium transition-colors"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                  >
                    {gameTitle}
                  </a>
                  <span className="text-text-dim"> a </span>
                  <span style={{ color: '#facc15' }}>★{rating}</span>
                  <span className="text-text-dim"> review</span>
                </>
              )
            }

            return (
              <div
                key={n.id}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <Avatar avatarUrl={avatarUrl} username={username} />
                <div className="flex-1 min-w-0 text-sm leading-snug">
                  {message}
                </div>
                <span className="text-[11px] text-text-muted shrink-0">
                  {relativeTime(n.created_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
