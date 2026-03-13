/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export { createClient }
export type { Database }
export type { Session, User, Provider, SupabaseClient } from '@supabase/supabase-js'
export type { Tables, TablesInsert, TablesUpdate } from './database.types'
export type TypedSupabaseClient = ReturnType<typeof createSupabaseClient>

// --- chunked cookie helpers ---
// Supabase sessions are ~2-3KB of JSON. A single cookie is capped at ~4096 bytes
// (name + value + attributes). Splitting into 3500-char chunks keeps each cookie
// safely under the limit while still sharing the session across *.cubeforge.dev.

const CHUNK = 3500
const isProd = () =>
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'

function cookieMeta() {
  const domain = isProd() ? '; domain=.cubeforge.dev' : ''
  const secure = isProd() ? '; Secure' : ''
  return { domain, secure, maxAge: 60 * 60 * 24 * 365 }
}

function escapeName(name: string) {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|; )' + escapeName(name) + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

function writeCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return
  const { domain, secure } = cookieMeta()
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${domain}${secure}`
}

function setChunked(key: string, value: string) {
  const { maxAge } = cookieMeta()
  // clear any existing chunks
  const prev = parseInt(readCookie(`${key}.__n`) ?? '0')
  for (let i = 0; i < prev; i++) writeCookie(`${key}.__${i}`, '', 0)

  const chunks = Math.ceil(value.length / CHUNK)
  writeCookie(`${key}.__n`, String(chunks), maxAge)
  for (let i = 0; i < chunks; i++) {
    writeCookie(`${key}.__${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK), maxAge)
  }
}

function getChunked(key: string): string | null {
  const n = parseInt(readCookie(`${key}.__n`) ?? '0')
  if (!n) return null
  let value = ''
  for (let i = 0; i < n; i++) {
    const chunk = readCookie(`${key}.__${i}`)
    if (chunk === null) return null
    value += chunk
  }
  return value
}

function removeChunked(key: string) {
  const n = parseInt(readCookie(`${key}.__n`) ?? '0')
  writeCookie(`${key}.__n`, '', 0)
  for (let i = 0; i < n; i++) writeCookie(`${key}.__${i}`, '', 0)
}

// Primary: localStorage (reliable, unlimited size, handles token refresh)
// Mirror:  chunked cookies (cross-subdomain *.cubeforge.dev sharing)
function makeStorage() {
  const ls = typeof window !== 'undefined' ? window.localStorage : null

  return {
    getItem(key: string): string | null {
      return ls?.getItem(key) ?? getChunked(key)
    },
    setItem(key: string, value: string): void {
      ls?.setItem(key, value)
      setChunked(key, value)
    },
    removeItem(key: string): void {
      ls?.removeItem(key)
      removeChunked(key)
    },
  }
}

export function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  return createClient<Database>(url, key, {
    auth: {
      storage: makeStorage(),
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
