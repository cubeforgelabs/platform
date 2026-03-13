import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { navigate('/signin', { replace: true }); return }
      const next = searchParams.get('next')
      if (next) { window.location.href = next; return }
      navigate('/', { replace: true })
    })
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-sm text-text-dim">Signing you in…</p>
    </div>
  )
}
