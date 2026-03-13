import { supabase } from './supabase'
import type { Tables } from '@cubeforgelabs/auth'

export type GameRow = Tables<'games'>
export type TagRow = Pick<Tables<'tags'>, 'name' | 'slug'>
export type ProfileRow = Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'>

export type GameListItem = GameRow & {
  profiles: ProfileRow
  game_tags: { tags: TagRow }[]
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

export async function fetchGames(): Promise<GameListItem[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*, profiles(username, display_name, avatar_url), game_tags(tags(name, slug))')
    .eq('published', true)
    .order('play_count', { ascending: false })
  if (error) throw error
  return data as GameListItem[]
}

export async function fetchGameById(id: string): Promise<GameListItem | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*, profiles(username, display_name, avatar_url), game_tags(tags(name, slug))')
    .eq('id', id)
    .single()
  if (error) return null
  return data as GameListItem
}

export function getGameTags(game: GameListItem): TagRow[] {
  return game.game_tags?.map((gt) => gt.tags).filter(Boolean) ?? []
}
