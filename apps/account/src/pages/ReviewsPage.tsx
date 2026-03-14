import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { Trash2 } from 'lucide-react'

type ReviewEntry = {
  id: string
  rating: number
  body: string | null
  created_at: string
  updated_at: string
  game_id: string
  games: {
    id: string
    title: string
    thumbnail_url: string | null
  } | null
}

export function ReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ReviewEntry[]>([])
  const [loading, setLoading] = useState(true)

  async function loadReviews() {
    if (!user) return
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, body, created_at, updated_at, game_id, games(id, title, thumbnail_url)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    setReviews((data as unknown as ReviewEntry[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadReviews() }, [user])

  async function deleteReview(id: string) {
    if (!window.confirm('Delete this review?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setReviews(r => r.filter(x => x.id !== id))
  }

  if (loading) return <div className="text-sm text-text-dim">Loading…</div>

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">My Reviews</h1>
        <p className="text-xs text-text-muted mt-1">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} across all games
        </p>
      </div>

      {reviews.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm text-text-dim">You haven't reviewed any games yet.</p>
          <a
            href="https://play.cubeforge.dev"
            className="text-xs mt-2 inline-block hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Browse games
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map(review => (
            <div
              key={review.id}
              className="rounded-xl p-4 flex gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {review.games?.thumbnail_url ? (
                <img
                  src={review.games.thumbnail_url}
                  alt=""
                  className="w-12 h-10 rounded-lg object-cover shrink-0 mt-0.5"
                />
              ) : (
                <div
                  className="w-12 h-10 rounded-lg shrink-0 mt-0.5"
                  style={{ background: 'var(--surface2)' }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://play.cubeforge.dev/game/${review.game_id}`}
                      className="text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                    >
                      {review.games?.title ?? 'Unknown Game'}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: '#facc15' }}>
                        {'★'.repeat(review.rating)}
                        <span className="text-text-muted">{'★'.repeat(5 - review.rating)}</span>
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(review.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="shrink-0 p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    title="Delete review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {review.body && (
                  <p className="text-xs text-text-dim leading-relaxed mt-2">{review.body}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
