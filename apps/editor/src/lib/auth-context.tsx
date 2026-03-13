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
    let ready = false
    const timeout = setTimeout(() => { if (!ready) { ready = true; setLoading(false) } }, 5000)

    supabase.auth.getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        if (!ready) { ready = true; setLoading(false) }
        return
      }
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
