import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, gameBundleUrl } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import type { Tables } from '@cubeforgelabs/auth'

type Game = Tables<'games'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'>
  avg_rating: number | null
  review_count: number
}
type Review = Tables<'reviews'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'>
}

export function GamePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [game, setGame] = useState<Game | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [myReview, setMyReview] = useState<{ rating: number; body: string } | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [srcdoc, setSrcdoc] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [reviewBody, setReviewBody] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return

    supabase.rpc('increment_plays', { game_id: id })

    Promise.all([
      supabase
        .from('games')
        .select('*, profiles!games_creator_id_fkey(username, display_name, avatar_url)')
        .eq('id', id)
        .single(),
      supabase
        .from('reviews')
        .select('*, profiles(username, display_name, avatar_url)')
        .eq('game_id', id)
        .order('created_at', { ascending: false }),
    ]).then(([gameRes, reviewsRes]) => {
      if (gameRes.data) {
        const rows = reviewsRes.data ?? []
        const avg = rows.length ? rows.reduce((s, r) => s + r.rating, 0) / rows.length : null
        setGame({ ...(gameRes.data as unknown as Game), avg_rating: avg, review_count: rows.length })
      }
      setReviews((reviewsRes.data as unknown as Review[]) ?? [])
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    supabase.from('favorites').select('user_id').eq('user_id', user.id).eq('game_id', id).single()
      .then(({ data }) => setIsFavorited(!!data))
    const mine = reviews.find(r => r.user_id === user.id)
    if (mine) setMyReview({ rating: mine.rating, body: mine.body ?? '' })
  }, [user, id, reviews])

  async function toggleFavorite() {
    if (!user) { window.location.href = 'https://account.cubeforge.dev/signin'; return }
    if (isFavorited) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('game_id', id!)
      setIsFavorited(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, game_id: id! })
      setIsFavorited(true)
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { window.location.href = 'https://account.cubeforge.dev/signin'; return }
    setSubmitting(true)
    const existing = reviews.find(r => r.user_id === user.id)
    if (existing) {
      await supabase.from('reviews').update({ rating: reviewRating, body: reviewBody }).eq('id', existing.id)
    } else {
      await supabase.from('reviews').insert({ game_id: id!, user_id: user.id, rating: reviewRating, body: reviewBody })
    }
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('game_id', id!)
      .order('created_at', { ascending: false })
    setReviews((data as unknown as Review[]) ?? [])
    setMyReview({ rating: reviewRating, body: reviewBody })
    setSubmitting(false)
  }

  if (loading) return <div className="flex items-center justify-center py-40 text-sm text-text-dim">Loading…</div>
  if (!game) return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-text mb-4">Game not found</h1>
      <Link to="/" className="text-sm text-accent hover:text-accent2">Back to home</Link>
    </div>
  )

  const author = game.profiles

  function toggleMute() {
    const next = !muted
    setMuted(next)
    iframeRef.current?.contentWindow?.postMessage({ cf: next }, '*')
  }

  function toggleFullscreen() {
    iframeRef.current?.requestFullscreen?.()
  }

  async function startPlaying() {
    if (!game!.bundle_path) return
    const { data } = await supabase.storage.from('games').download(game!.bundle_path)
    if (data) {
      const slug = game!.bundle_path.split('/')[0]
      const baseUrl = gameBundleUrl(`${slug}/`)
      const patchScript = `<script>
(function(){
  // CORS fix: set crossOrigin before src so WebGL texImage2D works cross-origin
  var NI=window.Image;
  function PI(w,h){var i=new NI(w,h);i.crossOrigin='anonymous';return i;}
  PI.prototype=NI.prototype;window.Image=PI;
  var oc=document.createElement.bind(document);
  document.createElement=function(t){var e=oc(t);if(t&&t.toLowerCase()==='img')e.crossOrigin='anonymous';return e;};
  // Mute bridge: intercept AudioContext, expose master gain via postMessage
  var gains=[];
  var Ctx=window.AudioContext||window.webkitAudioContext;
  if(Ctx){
    function PCtx(){var c=new Ctx();var g=c.createGain();g.connect(c.destination);gains.push(g);Object.defineProperty(c,'destination',{get:function(){return g;}});return c;}
    PCtx.prototype=Ctx.prototype;
    window.AudioContext=PCtx;if(window.webkitAudioContext)window.webkitAudioContext=PCtx;
  }
  window.addEventListener('message',function(e){
    if(!e.data||e.data.cf===undefined)return;
    gains.forEach(function(g){g.gain.setValueAtTime(e.data.cf?0:1,0);});
  });
})();
<\/script>`
      let html = await data.text()
      html = html.replace('<head>', `<head><base href="${baseUrl}">${patchScript}`)
      setSrcdoc(html)
    }
    setPlaying(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link to="/" className="hover:text-text-dim transition-colors">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-text-dim transition-colors">Browse</Link>
        <span>/</span>
        <span className="text-text-dim">{game.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main */}
        <div>
          {/* Game embed */}
          <div className="w-full aspect-[16/10] rounded-2xl border border-border overflow-hidden mb-6 bg-black relative">
            {playing && srcdoc ? (
              <>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <iframe
                  ref={iframeRef}
                  {...{ srcdoc } as any}
                  className="w-full h-full border-0"
                  allow="fullscreen; autoplay"
                  sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
                  title={game.title}
                />
                {/* Game toolbar */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-1 px-2 py-1.5 opacity-0 hover:opacity-100 transition-opacity duration-150"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                  <GameToolbarBtn onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
                    {muted ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="2" y1="2" x2="22" y2="22"/><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      </svg>
                    )}
                  </GameToolbarBtn>
                  <GameToolbarBtn onClick={toggleFullscreen} title="Fullscreen">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                    </svg>
                  </GameToolbarBtn>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center relative">
                {game.thumbnail_url && (
                  <img src={game.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                )}
                <button
                  onClick={startPlaying}
                  disabled={!game.bundle_path}
                  className="relative flex items-center gap-2.5 rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-bg hover:bg-accent2 transition-colors disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                  Play Game
                </button>
              </div>
            )}
          </div>

          {/* About */}
          <div className="rounded-xl border border-border bg-surface/50 p-6 mb-6">
            <h2 className="text-sm font-semibold text-text mb-3">About</h2>
            <p className="text-sm text-text-dim leading-relaxed">{game.description ?? 'No description.'}</p>
          </div>

          {/* Reviews */}
          <div className="rounded-xl border border-border bg-surface/50 p-6">
            <h2 className="text-sm font-semibold text-text mb-4">
              Reviews {reviews.length > 0 && <span className="text-text-muted font-normal">({reviews.length})</span>}
            </h2>

            {user && !myReview && (
              <form onSubmit={submitReview} className="mb-6 flex flex-col gap-3 border-b border-border pb-6">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}
                      className={`text-xl transition-colors ${n <= reviewRating ? 'text-yellow-400' : 'text-text-muted'}`}>★</button>
                  ))}
                </div>
                <textarea
                  value={reviewBody}
                  onChange={e => setReviewBody(e.target.value)}
                  placeholder="Share your thoughts…"
                  rows={3}
                  className="rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent/40 resize-none"
                />
                <button type="submit" disabled={submitting}
                  className="self-start rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-bg hover:bg-accent2 transition-colors disabled:opacity-50">
                  {submitting ? 'Posting…' : 'Post review'}
                </button>
              </form>
            )}

            {!user && (
              <div className="mb-6 text-center py-4 border-b border-border">
                <a href="https://account.cubeforge.dev/signin" className="text-xs text-accent hover:underline">
                  Sign in to leave a review
                </a>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(r => (
                  <div key={r.id} className="flex gap-3">
                    {r.profiles?.avatar_url ? (
                      <img src={r.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface2 border border-border shrink-0 flex items-center justify-center text-xs font-bold text-accent">
                        {(r.profiles?.display_name ?? r.profiles?.username ?? '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-text">{r.profiles?.display_name ?? r.profiles?.username}</span>
                        <span className="text-xs text-yellow-400">{'★'.repeat(r.rating)}<span className="text-text-muted">{'★'.repeat(5 - r.rating)}</span></span>
                        <span className="text-[10px] text-text-muted">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.body && <p className="text-xs text-text-dim leading-relaxed">{r.body}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface/50 p-5">
            <h1 className="text-xl font-bold text-text mb-1">{game.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              {author?.avatar_url && (
                <img src={author.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
              )}
              <span className="text-sm text-text-dim">by {author?.display_name ?? author?.username ?? 'CubeForge'}</span>
            </div>

            <div className="space-y-3 mb-5">
              <InfoRow label="Plays" value={game.plays.toLocaleString()} />
              {game.avg_rating !== null && (
                <InfoRow label="Rating" value={
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    {game.avg_rating.toFixed(1)} <span className="text-text-muted">({game.review_count})</span>
                  </span>
                } />
              )}
              {game.is_official && <InfoRow label="Publisher" value="CubeForge" />}
              <InfoRow label="Engine" value="CubeForge" />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {game.tags.map((tag) => (
                <Link key={tag} to={`/browse?tag=${tag}`}
                  className="text-[10px] font-mono text-accent/70 border border-accent/20 rounded px-2 py-0.5 hover:bg-accent/5 transition-colors">
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2.5">
            <button
              onClick={toggleFavorite}
              className={`w-full rounded-lg border px-4 py-2 text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                isFavorited
                  ? 'border-red/30 bg-red/10 text-red'
                  : 'border-border bg-surface2 text-text-dim hover:text-text hover:border-border2'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {isFavorited ? 'Favorited' : 'Favorite'}
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="w-full rounded-lg border border-border bg-surface2 px-4 py-2 text-xs font-medium text-text-dim hover:text-text hover:border-border2 transition-all flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GameToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-dim font-medium">{value}</span>
    </div>
  )
}
