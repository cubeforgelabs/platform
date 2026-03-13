import { useState, useEffect, useRef } from 'react'
import { UserAvatar } from './UserAvatar'

export interface UserMenuProps {
  avatarUrl?: string | null
  displayName?: string | null
  username?: string | null
  email?: string | null
  accountUrl?: string
  showAccountLink?: boolean
  onSignOut: () => void
  /** Visual variant — 'toolbar' for dark editor bars, 'navbar' for nav strips */
  variant?: 'toolbar' | 'navbar'
}

export function UserMenu({
  avatarUrl,
  displayName,
  username,
  email,
  accountUrl = 'https://account.cubeforge.dev',
  showAccountLink = true,
  onSignOut,
  variant = 'toolbar',
}: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const name = displayName ?? username ?? email ?? 'Account'

  const triggerStyle: React.CSSProperties = variant === 'toolbar'
    ? { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }
    : {
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
        color: 'inherit', fontSize: 12, fontWeight: 500,
      }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button style={triggerStyle} onClick={() => setOpen(o => !o)}>
        <UserAvatar avatarUrl={avatarUrl} displayName={displayName} username={username} email={email} size={28} />
        {variant === 'navbar' && (
          <span style={{ color: 'var(--text, #c9d0e8)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        )}
      </button>

      {open && (
        <div style={dropdownStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <UserAvatar avatarUrl={avatarUrl} displayName={displayName} username={username} email={email} size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #c9d0e8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
              {username && (
                <span style={{ fontSize: 11, color: 'var(--text-muted, #636e93)' }}>@{username}</span>
              )}
            </div>
          </div>

          <div style={dividerStyle} />

          {showAccountLink && (
            <>
              <a
                href={accountUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={itemStyle}
                onClick={() => setOpen(false)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Account
              </a>
              <div style={dividerStyle} />
            </>
          )}

          <button
            style={{ ...itemStyle, color: '#f38ba8', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
            onClick={() => { setOpen(false); onSignOut() }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  minWidth: 200,
  background: '#13151f',
  border: '1px solid #1f2435',
  borderRadius: 10,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  zIndex: 1000,
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
}

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: '#1f2435',
  margin: 0,
}

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 14px',
  fontSize: 13,
  color: 'var(--text-dim, #8b95b8)',
  textDecoration: 'none',
  transition: 'background 0.1s, color 0.1s',
  width: '100%',
  boxSizing: 'border-box',
}
