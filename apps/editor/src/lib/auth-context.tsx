import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User, Session } from '@cubeforgelabs/auth'

interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  username_confirmed: boolean
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, username_confirmed')
      .eq('id', userId)
      .single()
    setProfile(data as Profile | null)
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  useEffect(() => {
    let resolved = false
    function resolve() {
      if (!resolved) { resolved = true; setLoading(false) }
    }
    const timeout = setTimeout(resolve, 3000)

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) { loadProfile(s.user.id).finally(resolve) } else { resolve() }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) { await loadProfile(s.user.id) } else { setProfile(null) }
      resolve()
    })

    return () => { clearTimeout(timeout); subscription.unsubscribe() }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
