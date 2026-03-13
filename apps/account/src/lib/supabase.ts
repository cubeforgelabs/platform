import { createClient } from '@cubeforgelabs/auth'
import type { Database } from '@cubeforgelabs/auth'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'sb-omzeexpmpfsfecwlcmhq-auth-token',
  },
})
