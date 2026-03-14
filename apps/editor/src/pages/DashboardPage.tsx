import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProjects, deleteProject, createProject, syncLocalProjects } from '../lib/projects'
import { localCount } from '../lib/localProjects'
import { createEmptyDocument, type CsxDocument } from '../lib/csx'
import { useAuth } from '../lib/auth-context'
import { TEMPLATES } from '../templates'
import { UserMenu } from '@cubeforgelabs/ui'

interface ProjectItem {
  id: string
  name: string
  updated_at: string
  thumbnail_url: string | null
  local?: boolean
}

export function DashboardPage() {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('__blank__')
  const [localCount_, setLocalCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const hasSynced = useRef(false)

  function reload() {
    setLoading(true)
    listProjects()
      .then(p => { setProjects(p); setLoading(false) })
      .catch(() => setLoading(false))
  }

  // Load projects whenever auth settles
  useEffect(() => {
    if (authLoading) return
    reload()
  }, [authLoading, user?.id])

  // Count local projects when signed in (to show sync banner)
  useEffect(() => {
    if (!user || hasSynced.current) return
    localCount().then(setLocalCount)
  }, [user])

  async function handleSync() {
    setSyncing(true)
    await syncLocalProjects()
    hasSynced.current = true
    setSyncing(false)
    setSyncDone(true)
    setLocalCount(0)
    reload()
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      let doc: CsxDocument = createEmptyDocument(newName.trim())
      if (selectedTemplate !== '__blank__') {
        const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
        if (tpl) {
          doc = {
            ...doc,
            entities: tpl.entities,
            files: tpl.files ?? [],
            game: { ...doc.game, ...tpl.game },
            world: { ...doc.world, ...tpl.world },
          }
        }
      }
      const id = await createProject(newName.trim(), doc)
      if (id) navigate(`/project/${id}`)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    await deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const displayName = profile?.display_name ?? profile?.username ?? user?.email?.split('@')[0] ?? null

  return (
    <div className="dashboard">
      {/* Dashboard toolbar */}
      <div className="dashboard-toolbar">
        <div className="toolbar-logo">
          <img src="/favicon-96x96.png" alt="CubeForge" className="toolbar-logo-img" />
          <span className="toolbar-logo-text">cube<span>forge</span> editor</span>
        </div>

        <div style={{ flex: 1 }} />

        <a
          href="https://play.cubeforge.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="dashboard-link"
        >
          play.cubeforge.dev ↗
        </a>

        <div className="toolbar-divider" />

        {user ? (
          <UserMenu
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
            username={profile?.username}
            email={user.email}
            onSignOut={signOut}
            variant="toolbar"
          />
        ) : (
          <a
            href="https://account.cubeforge.dev/signin"
            className="dashboard-signin-btn"
          >
            Sign in
          </a>
        )}
      </div>

      {/* Sync banner — shown when signed in with pending local projects */}
      {user && localCount_ > 0 && !syncDone && (
        <div className="dashboard-sync-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>You have {localCount_} unsaved local project{localCount_ > 1 ? 's' : ''} from before you signed in.</span>
          <button onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Save to account'}
          </button>
          <button className="dashboard-sync-dismiss" onClick={() => setLocalCount(0)}>Dismiss</button>
        </div>
      )}

      {/* Main content */}
      <div className="dashboard-body">
        <div className="dashboard-header">
          <div>
            <h1>{displayName ? `Welcome back, ${displayName}` : 'CubeForge Editor'}</h1>
            <p>{user ? 'Your game projects' : 'Build browser games — no account required'}</p>
          </div>
          <button className="dashboard-new-btn" onClick={() => setShowNew(true)}>
            + New project
          </button>
        </div>

        {/* New project modal */}
        {showNew && (
          <div className="dashboard-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) { setShowNew(false); setNewName(''); setSelectedTemplate('__blank__') } }}>
            <div className="dashboard-modal">
              <div className="dashboard-new-header">
                <h3>New project</h3>
                <button className="dashboard-cancel-btn" onClick={() => { setShowNew(false); setNewName(''); setSelectedTemplate('__blank__') }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="dashboard-new-field">
                <label>Project name</label>
                <input
                  autoFocus
                  className="dashboard-new-input"
                  placeholder="My Awesome Game"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setShowNew(false); setNewName('') } }}
                />
              </div>

              <div className="dashboard-new-field">
                <label>Start from</label>
                <div className="dashboard-templates">
                  <button
                    className={`dashboard-template-card${selectedTemplate === '__blank__' ? ' active' : ''}`}
                    onClick={() => setSelectedTemplate('__blank__')}
                  >
                    <span className="dashboard-template-icon"><TemplateIcon id="__blank__" /></span>
                    <span className="dashboard-template-name">Blank</span>
                  </button>
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      className={`dashboard-template-card${selectedTemplate === t.id ? ' active' : ''}`}
                      onClick={() => setSelectedTemplate(t.id)}
                    >
                      <span className="dashboard-template-icon"><TemplateIcon id={t.id} /></span>
                      <span className="dashboard-template-name">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="dashboard-new-actions">
                <button className="dashboard-create-btn" onClick={handleCreate} disabled={creating || !newName.trim()}>
                  {creating ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="dashboard-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            <p>No projects yet</p>
            <p className="dashboard-empty-sub">
              {user ? 'Create your first game to get started' : 'Projects are saved locally in your browser — sign in to sync them to your account'}
            </p>
            <button className="dashboard-new-btn" onClick={() => setShowNew(true)}>Create project</button>
          </div>
        ) : (
          <div className="dashboard-grid">
            {projects.map(p => (
              <div
                key={p.id}
                className="dashboard-card"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div className="dashboard-card-thumb">
                  {p.thumbnail_url ? (
                    <img src={p.thumbnail_url} alt={p.name} />
                  ) : (
                    <div className="dashboard-card-thumb-placeholder">
                      <span>{p.name[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="dashboard-card-info">
                  <p className="dashboard-card-name">{p.name}</p>
                  <p className="dashboard-card-date">
                    {p.local && <span className="dashboard-card-local">local</span>}
                    {formatDate(p.updated_at)}
                  </p>
                </div>
                <button
                  className="dashboard-card-delete"
                  onClick={e => handleDelete(p.id, e)}
                  title="Delete project"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 3h8M5 3V2h2v1M4 3l.5 7h3L8 3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TemplateIcon({ id }: { id: string }) {
  const s = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (id) {
    case '__blank__': return <svg {...s}><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
    case 'platformer': return <svg {...s}><circle cx="12" cy="5" r="2"/><path d="M12 7v5"/><path d="M9 10l3 2 3-2"/><path d="M10 17l2-5 2 5"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
    case 'particles': return <svg {...s}><circle cx="12" cy="12" r="1.5"/><circle cx="5" cy="7" r="1"/><circle cx="19" cy="7" r="1"/><circle cx="5" cy="17" r="1"/><circle cx="19" cy="17" r="1"/><path d="M12 10.5L6 8M12 10.5l6-2.5M12 13.5l-6 2M12 13.5l6 2"/></svg>
    case 'physics': return <svg {...s}><path d="M13 2L4 13h7l-2 9 9-12h-7l2-8z"/></svg>
    case 'combat': return <svg {...s}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    case 'camera': return <svg {...s}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3.5"/></svg>
    case 'script': return <svg {...s}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'triggers': return <svg {...s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'shapes': return <svg {...s}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
    case 'top-down': return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>
    case 'input-map': return <svg {...s}><rect x="2" y="8" width="20" height="13" rx="2"/><path d="M12 12v4M10 14h4"/><circle cx="7" cy="14" r="1" fill="currentColor"/><circle cx="17" cy="12" r="1" fill="currentColor"/><circle cx="17" cy="16" r="1" fill="currentColor"/></svg>
    case 'timers': return <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    case 'empty': return <svg {...s}><circle cx="12" cy="12" r="9" strokeDasharray="3 3"/><path d="M12 8v4M12 16h.01"/></svg>
    default: return <svg {...s}><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
