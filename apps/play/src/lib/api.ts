import { supabase } from './supabase'
import type { Tables } from '@cubeforgelabs/auth'

export type GameListItem = Tables<'games'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'>
  avg_rating: number | null
  review_count: number
}

function accentColor(str: string): string {
  const colors = ['#4fc3f7', '#81c784', '#ffb74d', '#f06292', '#ba68c8', '#4dd0e1', '#aed581']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function gameColor(game: GameListItem): string {
  return accentColor(game.id)
}

function computeRating(raw: unknown): { avg_rating: number | null; review_count: number } {
  const reviews = (raw as { rating: number }[] | null) ?? []
  if (!reviews.length) return { avg_rating: null, review_count: 0 }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  return { avg_rating: avg, review_count: reviews.length }
}

export async function fetchGames(): Promise<GameListItem[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*, profiles!games_author_id_fkey(username, display_name, avatar_url), reviews(rating)')
    .not('bundle_path', 'is', null)
    .order('plays', { ascending: false })
  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(g => ({ ...g, ...computeRating(g.reviews) })) as unknown as GameListItem[]
}

export async function fetchGameById(id: string): Promise<GameListItem | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*, profiles!games_author_id_fkey(username, display_name, avatar_url), reviews(rating)')
    .eq('id', id)
    .single()
  if (error) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = data as any
  return { ...g, ...computeRating(g.reviews) } as unknown as GameListItem
}
