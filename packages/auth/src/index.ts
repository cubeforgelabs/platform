/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export { createClient }
export type { Database }
export type { Session, User, Provider, SupabaseClient } from '@supabase/supabase-js'
export type { Tables, TablesInsert, TablesUpdate } from './database.types'
export type TypedSupabaseClient = ReturnType<typeof createSupabaseClient>

function makeCookieStorage() {
  const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  const domain = isProd ? '.cubeforge.dev' : ''
  const secure = isProd ? '; Secure' : ''
  const maxAge = 60 * 60 * 24 * 365

  return {
    getItem(key: string): string | null {
      if (typeof document === 'undefined') return null
      const match = document.cookie.match(new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)'))
      return match ? decodeURIComponent(match[1]) : null
    },
    setItem(key: string, value: string): void {
      if (typeof document === 'undefined') return
      const domainPart = domain ? `; domain=${domain}` : ''
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${domainPart}${secure}`
    },
    removeItem(key: string): void {
      if (typeof document === 'undefined') return
      const domainPart = domain ? `; domain=${domain}` : ''
      document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax${domainPart}${secure}`
    },
  }
}

export function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  return createClient<Database>(url, key, {
    auth: {
      storage: makeCookieStorage(),
      detectSessionInUrl: true,
      persistSession: true,
    },
  })
}

let _client: ReturnType<typeof createSupabaseClient> | null = null
export function getSupabaseClient() {
  if (!_client) _client = createSupabaseClient()
  return _client
}

export * from './auth'
