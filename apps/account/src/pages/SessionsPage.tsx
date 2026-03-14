import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import { Monitor, Smartphone, Trash2 } from 'lucide-react'

type SessionRow = {
  id: string
  session_key: string
  user_agent: string | null
  created_at: string
  last_seen: string
}

function parseUA(ua: string | null): { browser: string; os: string; mobile: boolean } {
  if (!ua) return { browser: 'Unknown', os: 'Unknown', mobile: false }
  const mobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) ? 'Safari' :
    'Browser'
  const os =
    /Windows/.test(ua) ? 'Windows' :
    /Macintosh/.test(ua) ? 'macOS' :
    /Linux/.test(ua) ? 'Linux' :
    /Android/.test(ua) ? 'Android' :
    /iPhone/.test(ua) ? 'iOS' :
    /iPad/.test(ua) ? 'iPadOS' :
    'Unknown OS'
  return { browser, os, mobile }
}

export function SessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [currentKey] = useState(() => localStorage.getItem('cf-session-key') ?? '')

  async function loadSessions() {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('user_sessions')
      .select('id, session_key, user_agent, created_at, last_seen')
      .eq('user_id', user.id)
      .order('last_seen', { ascending: false })
    setSessions(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadSessions() }, [user])

  async function revokeSession(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('user_sessions').delete().eq('id', id)
    setSessions(s => s.filter(x => x.id !== id))
  }

  async function revokeOthers() {
    if (!user || !window.confirm('Sign out all other devices?')) return
    await supabase.auth.signOut({ scope: 'others' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('user_sessions')
      .delete()
      .eq('user_id', user.id)
      .neq('session_key', currentKey)
    setSessions(s => s.filter(x => x.session_key === currentKey))
  }

  if (loading) return <div className="text-sm text-text-dim">Loading…</div>

  const hasOthers = sessions.some(s => s.session_key !== currentKey)

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Sessions</h1>
          <p className="text-xs text-text-muted mt-1">Devices where you're signed in</p>
        </div>
        {hasOthers && (
          <button
            onClick={revokeOthers}
            className="text-xs text-text-muted hover:text-text transition-colors"
          >
            Sign out all others
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm text-text-dim">No active sessions found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sessions.map(s => {
            const { browser, os, mobile } = parseUA(s.user_agent)
            const isCurrent = s.session_key === currentKey
            return (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-xl p-4"
                style={{
                  background: 'var(--surface)',
                  border: isCurrent
                    ? '1px solid color-mix(in srgb, var(--accent) 35%, transparent)'
                    : '1px solid var(--border)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface2)' }}
                >
                  {mobile
                    ? <Smartphone size={16} className="text-text-dim" />
                    : <Monitor size={16} className="text-text-dim" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm text-text font-medium">{browser} on {os}</p>
                    {isCurrent && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
                          color: 'var(--accent)',
                        }}
                      >
                        This device
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Last seen{' '}
                    {new Date(s.last_seen).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                    {' · '}
                    First seen{' '}
                    {new Date(s.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
                {!isCurrent && (
                  <button
                    onClick={() => revokeSession(s.id)}
                    className="shrink-0 p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    title="Revoke session"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
