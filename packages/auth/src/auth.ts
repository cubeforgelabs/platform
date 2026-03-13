import { getSupabaseClient } from './index'
import type { Provider } from '@supabase/supabase-js'

export async function signInWithOAuth(provider: Provider, redirectAfter?: string) {
  const supabase = getSupabaseClient()
  const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
  if (redirectAfter) callbackUrl.searchParams.set('next', redirectAfter)
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl.toString() },
  })
}

export async function signInWithEmail(email: string, password: string) {
  return getSupabaseClient().auth.signInWithPassword({ email, password })
}

export async function signUpWithEmail(email: string, password: string) {
  return getSupabaseClient().auth.signUp({ email, password })
}

export async function signOut() {
  return getSupabaseClient().auth.signOut()
}

export async function getSession() {
  return getSupabaseClient().auth.getSession()
}

export async function getUser() {
  return getSupabaseClient().auth.getUser()
}

export function onAuthStateChange(callback: Parameters<ReturnType<typeof getSupabaseClient>['auth']['onAuthStateChange']>[0]) {
  return getSupabaseClient().auth.onAuthStateChange(callback)
}
