import { getSupabaseClient, type TypedSupabaseClient } from '@cubeforgelabs/auth'
export const supabase: TypedSupabaseClient = getSupabaseClient()

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
export function gameBundleUrl(bundlePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/games/${bundlePath}`
}
