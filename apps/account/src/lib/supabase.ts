import { createClient } from '@cubeforgelabs/auth'
import type { Database } from '@cubeforgelabs/auth'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

console.log('[supabase] url:', url)
console.log('[supabase] key:', key ? key.slice(0, 30) + '...' : 'MISSING')

if (!url || !key) {
  console.error('[supabase] MISSING ENV VARS — all queries will fail')
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'sb-omzeexpmpfsfecwlcmhq-auth-token',
  },
})
