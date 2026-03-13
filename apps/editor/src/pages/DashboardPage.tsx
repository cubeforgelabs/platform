import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProjects, deleteProject, createProject } from '../lib/projects'
import { createEmptyDocument, type CsxDocument } from '../lib/csx'
import { useAuth } from '../lib/auth-context'
import { TEMPLATES } from '../templates'

interface ProjectItem {
  id: string
  name: string
  updated_at: string
  thumbnail_url: string | null
}

export function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('__blank__')

  useEffect(() => {
    listProjects().then(p => { setProjects(p); setLoading(false) })
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    let doc: CsxDocument = createEmptyDocument(newName.trim())
    if (selectedTemplate !== '__blank__') {
      const tpl = TEMPLATES.find(t => t.id === selectedTemplate)
      if (tpl) doc = { ...doc, files: tpl.files }
    }
    const id = await createProject(newName.trim(), doc)
    setCreating(false)
    if (id) navigate(`/project/${id}`)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    await deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const displayName = profile?.display_name ?? profile?.username ?? user?.email?.split('@')[0] ?? 'there'
  const initials = (profile?.display_name ?? profile?.username ?? user?.email ?? '?')[0].toUpperCase()

  return (
    <div className="dashboard">
      {/* Dashboard toolbar */}
      <div className="dashboard-toolbar">
        <div className="toolbar-logo">
          <div className="toolbar-logo-mark">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" fill="#0b0d14" />
              <rect x="7" y="1" width="4" height="4" fill="#0b0d14" />
              <rect x="1" y="7" width="4" height="4" fill="#0b0d14" />
              <rect x="7" y="7" width="4" height="4" fill="#0b0d14" />
            </svg>
          </div>
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

        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="dashboard-avatar" />
        ) : (
          <div className="dashboard-avatar-initial">{initials}</div>
        )}

        <button className="dashboard-signout" onClick={() => signOut()}>Sign out</button>
      </div>

      {/* Main content */}
      <div className="dashboard-body">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {displayName}</h1>
            <p>Your game projects</p>
          </div>
          <button className="dashboard-new-btn" onClick={() => setShowNew(true)}>
            + New project
          </button>
        </div>

        {/* New project dialog */}
        {showNew && (
          <div className="dashboard-new-card">
            <div className="dashboard-new-header">
              <h3>New project</h3>
              <button className="dashboard-cancel-btn" onClick={() => { setShowNew(false); setNewName(''); setSelectedTemplate('__blank__') }}>✕</button>
            </div>

            <div className="dashboard-new-field">
              <label>Project name</label>
              <input
                autoFocus
                className="dashboard-new-input"
                placeholder="My Awesome Game"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNew(false) }}
              />
            </div>

            <div className="dashboard-new-field">
              <label>Start from</label>
              <div className="dashboard-templates">
                <button
                  className={`dashboard-template-card${selectedTemplate === '__blank__' ? ' active' : ''}`}
                  onClick={() => setSelectedTemplate('__blank__')}
                >
                  <span className="dashboard-template-icon">⬜</span>
                  <span className="dashboard-template-name">Blank</span>
                </button>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    className={`dashboard-template-card${selectedTemplate === t.id ? ' active' : ''}`}
                    onClick={() => setSelectedTemplate(t.id)}
                  >
                    <span className="dashboard-template-icon">{t.icon}</span>
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
        )}

        {loading ? (
          <div className="dashboard-loading">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">🎮</div>
            <p>No projects yet</p>
            <p className="dashboard-empty-sub">Create your first game to get started</p>
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
                  <p className="dashboard-card-date">{formatDate(p.updated_at)}</p>
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

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
