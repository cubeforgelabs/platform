import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@cubeforgelabs/auth'
import type { Tables } from '@cubeforgelabs/auth'
import { supabase } from './supabase'

type Profile = Tables<'profiles'>

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    console.log('[auth] loadProfile: starting SELECT for', userId)
    try {
      const queryPromise = supabase.from('profiles').select('*').eq('id', userId).single()
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('loadProfile timed out after 8s')), 8000)
      )
      const result = await Promise.race([queryPromise, timeoutPromise]) as Awaited<typeof queryPromise>
      console.log('[auth] loadProfile: result', { data: result.data, error: result.error })
      setProfile(result.data ?? null)
    } catch (e) {
      console.error('[auth] loadProfile: error', e)
      setProfile(null)
    }
  }

  async function refreshProfile() {
    if (session?.user) await loadProfile(session.user.id)
  }

  useEffect(() => {
    let ready = false
    const timeout = setTimeout(() => { if (!ready) { ready = true; setLoading(false) } }, 5000)

    // getSession() bootstraps the Supabase client's internal session cache so
    // that subsequent queries (upsert, select, etc.) can attach the auth header.
    // onAuthStateChange fires INITIAL_SESSION right after and loads the profile.
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[auth] getSession result:', { session: data.session, error })
      console.log('[auth] user:', data.session?.user ?? null)
      console.log('[auth] access_token:', data.session?.access_token ? data.session.access_token.slice(0, 40) + '...' : null)
      console.log('[auth] localStorage keys:', Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-')))
      console.log('[auth] cookies:', document.cookie)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s)
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        if (!ready) { ready = true; setLoading(false) }
        return
      }
      // SIGNED_IN fires during _recoverAndRefresh before the token is usable.
      // Wait for INITIAL_SESSION (or TOKEN_REFRESHED) which fires once the token is ready.
      if (event === 'SIGNED_IN') return
      if (s?.user) {
        await loadProfile(s.user.id)
      } else {
        setProfile(null)
      }
      if (!ready) { ready = true; setLoading(false) }
    })

    return () => { clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
