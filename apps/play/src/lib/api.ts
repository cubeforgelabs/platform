import { supabase } from './supabase'
import type { Tables } from '@cubeforgelabs/auth'

export type GameListItem = Tables<'games'> & {
  profiles: Pick<Tables<'profiles'>, 'username' | 'display_name' | 'avatar_url'>
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
    .select('*, profiles!games_creator_id_fkey(username, display_name, avatar_url)')
    .not('bundle_path', 'is', null)
    .order('plays', { ascending: false })
  if (error) throw error
  return data as unknown as GameListItem[]
}

export async function fetchGameById(id: string): Promise<GameListItem | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*, profiles!games_creator_id_fkey(username, display_name, avatar_url)')
    .eq('id', id)
    .single()
  if (error) return null
  return data as unknown as GameListItem
}
