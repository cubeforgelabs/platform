import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor, { type Monaco } from '@monaco-editor/react'
import { compile, bundle, buildIframeSrcdoc } from './compiler'
import { csxToTsx } from './lib/codegen'
import { tsxToCsx, isCsxGeneratedCode } from './lib/tsxToCsx'
import { saveProject, loadProject } from './lib/projects'
import { createEmptyDocument, type CsxDocument } from './lib/csx'
import { touch } from './lib/csxUtils'
import { useAuth } from './lib/auth-context'
import { UserMenu } from '@cubeforgelabs/ui'
import { HierarchyPanel } from './components/HierarchyPanel'
import { InspectorPanel } from './components/InspectorPanel'
import { CanvasOverlay } from './components/CanvasOverlay'
import { PublishModal } from './components/PublishModal'
import { AssetPanel } from './components/AssetPanel'

type ViewMode = 'visual' | 'code'
type RunStatus = { kind: 'idle' } | { kind: 'ok' } | { kind: 'building' } | { kind: 'error'; message: string }

// ── Debounce ──────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── Save indicator ────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved'

// ── App ───────────────────────────────────────────────────────────────────────

export function App() {
  const { projectId: urlProjectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  // Core state
  const [doc, setDoc] = useState<CsxDocument>(() => createEmptyDocument('Untitled'))
  const [projectId, setProjectId] = useState<string | null>(urlProjectId ?? null)
  const [projectName, setProjectName] = useState('Untitled')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('visual')
  const [isPlaying, setIsPlaying] = useState(false)

  // Preview
  const [srcdoc, setSrcdoc] = useState('')
  const [iframeKey, setIframeKey] = useState(0)
  const [runStatus, setRunStatus] = useState<RunStatus>({ kind: 'idle' })
  const [iframeError, setIframeError] = useState<string | null>(null)

  // Save state
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [projectLoaded, setProjectLoaded] = useState(false)

  // Publish
  const [leftTab, setLeftTab] = useState<'scene' | 'assets'>('scene')
  const [showPublish, setShowPublish] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(doc.meta.game_id ? `https://play.cubeforge.dev/game/${doc.meta.game_id}` : null)

  // Canvas viewport
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [gridSize] = useState(32)

  // Monaco code (when in code mode)
  const [codeFiles, setCodeFiles] = useState<{ name: string; content: string }[]>([])
  const [activeCodeFile, setActiveCodeFile] = useState('main.tsx')
  const [monacoVersion, setMonacoVersion] = useState(0)
  const [newFileName, setNewFileName] = useState('')
  const [creatingFile, setCreatingFile] = useState(false)

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const centerPanelRef = useRef<HTMLDivElement>(null)
  const docRef = useRef(doc)
  useEffect(() => { docRef.current = doc }, [doc])

  // ── Load project ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!urlProjectId) { setProjectLoaded(true); return }
    loadProject(urlProjectId).then(result => {
      if (!result) { setProjectLoaded(true); return }
      let loadedDoc = result.doc
      // If project has template files but no entities, parse them into the entity tree
      const mainFile = loadedDoc.files.find(f => f.name === 'main.tsx')
      if (mainFile && isCsxGeneratedCode(mainFile.content) && loadedDoc.entities.length === 0) {
        loadedDoc = tsxToCsx(mainFile.content, loadedDoc)
        loadedDoc.files = loadedDoc.files.filter(f => f.name !== 'main.tsx')
      }
      setDoc(loadedDoc)
      setProjectName(loadedDoc.meta.name)
      setProjectId(result.id)
      setProjectLoaded(true)
      if (loadedDoc.meta.game_id) {
        setPublishedUrl(`https://play.cubeforge.dev/game/${loadedDoc.meta.game_id}`)
      }
    })
  }, [urlProjectId])

  // ── Auto-save (debounced 2s) ────────────────────────────────────────────────

  const debouncedDoc = useDebounce(doc, 2000)

  useEffect(() => {
    if (!projectLoaded || !user) return
    setSaveState('saving')
    saveProject(projectId, projectName, debouncedDoc).then(id => {
      if (id && !projectId) {
        setProjectId(id)
        navigate(`/project/${id}`, { replace: true })
      }
      setSaveState('saved')
      setLastSaved(new Date())
      setTimeout(() => setSaveState('idle'), 2000)
    })
  }, [debouncedDoc]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync view mode → Monaco files ──────────────────────────────────────────

  useEffect(() => {
    if (viewMode === 'code') {
      const files = csxToTsx(doc)
      setCodeFiles(files)
      setActiveCodeFile('main.tsx')
      setMonacoVersion(v => v + 1)
    }
  }, [viewMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── iframe error listener ───────────────────────────────────────────────────

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === 'iframe-error') {
        setIframeError(e.data.message)
        setRunStatus({ kind: 'error', message: e.data.message })
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // ── Keyboard shortcut ───────────────────────────────────────────────────────

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleRun() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Run ─────────────────────────────────────────────────────────────────────

  const handleRun = useCallback(() => {
    setRunStatus({ kind: 'building' })
    setIframeError(null)
    setIsPlaying(true)
    setTimeout(() => {
      const files = viewMode === 'code' ? codeFiles : csxToTsx(docRef.current)
      const source = bundle(files)
      const result = compile(source)
      if (result.error !== null) {
        setSrcdoc('')
        setRunStatus({ kind: 'error', message: result.error })
        setIsPlaying(false)
      } else {
        setSrcdoc(buildIframeSrcdoc(result.code))
        setIframeKey(k => k + 1)
        setRunStatus({ kind: 'ok' })
      }
    }, 0)
  }, [viewMode, codeFiles])

  function handleStop() {
    setIsPlaying(false)
    setSrcdoc('')
    setRunStatus({ kind: 'idle' })
    setIframeError(null)
  }

  // ── Doc changes ─────────────────────────────────────────────────────────────

  function handleDocChange(newDoc: CsxDocument) {
    setDoc(touch(newDoc))
  }

  // ── Monaco mount ────────────────────────────────────────────────────────────

  function handleEditorMount(_: unknown, monaco: Monaco) {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      jsxImportSource: 'react',
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    })
  }

  // ── Publish success ─────────────────────────────────────────────────────────

  function handlePublishSuccess(gameId: string, url: string, updatedDoc: CsxDocument) {
    setDoc(updatedDoc)
    setPublishedUrl(url)
    setShowPublish(false)
    // Auto-save with updated game_id
    saveProject(projectId, projectName, updatedDoc)
  }

  // ── Rename project ──────────────────────────────────────────────────────────

  function handleRenameProject(name: string) {
    setProjectName(name)
    setDoc(prev => ({ ...prev, meta: { ...prev.meta, name } }))
  }

  const errorMessage = runStatus.kind === 'error' ? runStatus.message : iframeError
  const currentCodeFile = codeFiles.find(f => f.name === activeCodeFile)

  if (!projectLoaded) {
    return <div className="editor-loading">Loading project…</div>
  }

  return (
    <div className="editor-root">
      {/* Toolbar */}
      <div className="toolbar">
        {/* Logo */}
        <div className="toolbar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/favicon-96x96.png" alt="CubeForge" className="toolbar-logo-img" />
          <span className="toolbar-logo-text">cube<span>forge</span></span>
        </div>

        <div className="toolbar-divider" />

        {/* Project name */}
        <ProjectNameInput value={projectName} onChange={handleRenameProject} />

        {/* Save state */}
        <SaveIndicator state={saveState} lastSaved={lastSaved} />

        <div className="toolbar-spacer" />

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${viewMode === 'visual' ? ' active' : ''}`}
            onClick={() => {
              // Sync code → visual: parse main.tsx back into entities
              if (viewMode === 'code') {
                const mainFile = codeFiles.find(f => f.name === 'main.tsx')
                if (mainFile && isCsxGeneratedCode(mainFile.content)) {
                  const updated = tsxToCsx(mainFile.content, doc)
                  const otherFiles = codeFiles.filter(f => f.name !== 'main.tsx')
                  setDoc({ ...updated, files: otherFiles })
                }
              }
              setViewMode('visual')
              setIsPlaying(false)
            }}
          >
            Visual
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'code' ? ' active' : ''}`}
            onClick={() => setViewMode('code')}
          >
            Code
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Run / Stop */}
        {isPlaying ? (
          <button className="run-btn stop-btn" onClick={handleStop}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="2" y="2" width="6" height="6" rx="1" />
            </svg>
            STOP
          </button>
        ) : (
          <button className="run-btn" onClick={handleRun}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2 1.5l6 3.5-6 3.5V1.5z" />
            </svg>
            RUN
            <span className="run-btn-hint">⌘↵</span>
          </button>
        )}

        {/* Publish */}
        {user && (
          <>
            {publishedUrl && (
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="published-link">
                View live ↗
              </a>
            )}
            <button className="publish-btn" onClick={() => setShowPublish(true)}>
              {doc.meta.game_id ? 'Update' : 'Publish'}
            </button>
          </>
        )}

        <div className="toolbar-divider" />

        {/* User */}
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
          <a href={`https://account.cubeforge.dev/signin?redirect_to=${encodeURIComponent(window.location.href)}`}
            className="toolbar-signin">
            Sign in
          </a>
        )}
      </div>

      {/* Body */}
      <div className={`editor-body${viewMode === 'code' ? ' code-mode' : ''}`}>
        {/* Left panel — hidden in code mode */}
        <div className="left-panel">
          <div className="left-tabs">
            <button className={`left-tab${leftTab === 'scene' ? ' active' : ''}`} onClick={() => setLeftTab('scene')}>Scene</button>
            <button className={`left-tab${leftTab === 'assets' ? ' active' : ''}`} onClick={() => setLeftTab('assets')}>Assets</button>
          </div>
          {leftTab === 'scene' ? (
            <HierarchyPanel
              doc={doc}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={handleDocChange}
            />
          ) : (
            <AssetPanel projectId={projectId} />
          )}
        </div>

        {/* Center panel */}
        <div className="center-panel" ref={centerPanelRef}>
          {viewMode === 'visual' ? (
            <div className="visual-view">
              {/* Static game preview */}
              <div className="visual-canvas-wrap">
                {srcdoc && isPlaying ? (
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    srcDoc={srcdoc}
                    sandbox="allow-scripts allow-pointer-lock allow-same-origin"
                    allow="autoplay"
                    title="game preview"
                    className="game-iframe"
                  />
                ) : (
                  <div className="visual-static">
                    <div className="visual-static-bg" style={{ background: doc.world.background }} />
                    <CanvasOverlay
                      doc={doc}
                      selectedId={selectedId}
                      snapToGrid={snapToGrid}
                      gridSize={gridSize}
                      zoom={zoom}
                      pan={pan}
                      onSelect={setSelectedId}
                      onChange={handleDocChange}
                      onZoomChange={setZoom}
                      onPanChange={setPan}
                      containerRef={centerPanelRef}
                    />
                    {!isPlaying && (
                      <div className="visual-play-hint">
                        Press Run to play • Drag entities to position
                      </div>
                    )}
                  </div>
                )}
                {errorMessage && (
                  <div className="error-overlay">
                    <div className="error-box">{errorMessage}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Code view */
            <div className="code-view">
              {/* File explorer sidebar */}
              <div className="code-file-sidebar">
                <div className="code-file-sidebar-header">
                  <span>FILES</span>
                  <button
                    className="code-file-new-btn"
                    title="New file"
                    onClick={() => setCreatingFile(true)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="19"/><line x1="9" y1="16" x2="15" y2="16"/>
                    </svg>
                  </button>
                </div>
                <div className="code-file-list">
                  {codeFiles.map(f => (
                    <div
                      key={f.name}
                      className={`code-file-item${f.name === activeCodeFile ? ' active' : ''}`}
                      onClick={() => setActiveCodeFile(f.name)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="code-file-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span>{f.name}</span>
                    </div>
                  ))}
                  {creatingFile && (
                    <div className="code-file-item creating">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="code-file-icon">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <input
                        autoFocus
                        className="code-file-name-input"
                        placeholder="filename.tsx"
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const name = newFileName.trim()
                            if (name && !codeFiles.find(f => f.name === name)) {
                              setCodeFiles(prev => [...prev, { name, content: '' }])
                              setActiveCodeFile(name)
                              setMonacoVersion(v => v + 1)
                            }
                            setCreatingFile(false)
                            setNewFileName('')
                          }
                          if (e.key === 'Escape') { setCreatingFile(false); setNewFileName('') }
                        }}
                        onBlur={() => { setCreatingFile(false); setNewFileName('') }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="editor-body-inner">
                <Editor
                  key={monacoVersion}
                  path={`file:///${activeCodeFile}`}
                  defaultLanguage="typescript"
                  theme="vs-dark"
                  defaultValue={currentCodeFile?.content ?? ''}
                  onChange={v => {
                    if (v === undefined) return
                    setCodeFiles(prev => prev.map(f => f.name === activeCodeFile ? { ...f, content: v } : f))
                  }}
                  onMount={handleEditorMount}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    wordWrap: 'on',
                    padding: { top: 12 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontLigatures: true,
                    lineHeight: 20,
                    renderLineHighlight: 'gutter',
                    smoothScrolling: true,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right panel — inspector in visual mode, preview in code mode */}
        <div className="right-panel">
          {viewMode === 'code' ? (
            <div className="code-preview-panel">
              <div className="preview-tab-bar"><span>PREVIEW</span></div>
              <div className="preview-body">
                {srcdoc ? (
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    srcDoc={srcdoc}
                    sandbox="allow-scripts allow-pointer-lock"
                    title="game preview"
                  />
                ) : (
                  <div className="preview-empty">Run to see preview</div>
                )}
                {errorMessage && (
                  <div className="error-overlay">
                    <div className="error-box">{errorMessage}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <InspectorPanel doc={doc} selectedId={selectedId} onChange={handleDocChange} />
          )}
        </div>
      </div>

      {/* Publish modal */}
      {showPublish && user && (
        <PublishModal
          doc={doc}
          userId={user.id}
          onClose={() => setShowPublish(false)}
          onSuccess={handlePublishSuccess}
        />
      )}
    </div>
  )
}

// ── Project name input ────────────────────────────────────────────────────────

function ProjectNameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function commit() {
    const name = draft.trim() || value
    setDraft(name)
    onChange(name)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        className="project-name-input"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
      />
    )
  }
  return (
    <button className="project-name-btn" onClick={() => { setDraft(value); setEditing(true) }}>
      {value}
    </button>
  )
}

// ── Save indicator ────────────────────────────────────────────────────────────

function SaveIndicator({ state, lastSaved }: { state: SaveState; lastSaved: Date | null }) {
  if (state === 'saving') return <span className="save-indicator">Saving…</span>
  if (state === 'saved') return <span className="save-indicator saved">Saved</span>
  if (lastSaved) return <span className="save-indicator">{formatTime(lastSaved)}</span>
  return null
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

