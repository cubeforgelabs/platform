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
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      console.log('[auth] onAuthStateChange event:', _event, '| user:', s?.user?.id ?? null)
      setSession(s)
      if (s?.user) {
        console.log('[auth] loading profile for', s.user.id)
        await loadProfile(s.user.id)
        console.log('[auth] profile loaded')
      } else {
        console.log('[auth] no user — clearing profile')
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
