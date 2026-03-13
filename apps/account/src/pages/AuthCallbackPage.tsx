import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate(data.session ? '/' : '/signin', { replace: true })
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-sm text-text-dim">Signing you in…</p>
    </div>
  )
}
