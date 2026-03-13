import { type CSSProperties } from 'react'

export interface UserAvatarProps {
  avatarUrl?: string | null
  displayName?: string | null
  username?: string | null
  email?: string | null
  size?: number
  style?: CSSProperties
  className?: string
}

export function UserAvatar({ avatarUrl, displayName, username, email, size = 28, style, className }: UserAvatarProps) {
  const label = (displayName ?? username ?? email ?? '?')[0].toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }}
        className={className}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(10, size * 0.4),
        fontWeight: 700,
        flexShrink: 0,
        background: 'rgba(79,195,247,0.15)',
        color: '#4fc3f7',
        border: '1px solid rgba(79,195,247,0.25)',
        userSelect: 'none',
        ...style,
      }}
      className={className}
    >
      {label}
    </div>
  )
}
