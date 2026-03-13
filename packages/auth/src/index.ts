import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export { createClient }
export type { Database }

export function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  return createClient<Database>(url, key)
}

// Singleton for apps that don't need SSR
let _client: ReturnType<typeof createSupabaseClient> | null = null
export function getSupabaseClient() {
  if (!_client) _client = createSupabaseClient()
  return _client
}

export * from './auth'
