import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'

interface Asset {
  name: string
  fullPath: string
  publicUrl: string
  size: number
  mimeType: string
}

interface Props {
  projectId: string | null
}

export function AssetPanel({ projectId }: Props) {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const folder = user && projectId ? `${user.id}/${projectId}` : null

  useEffect(() => {
    if (!folder) return
    loadAssets()
  }, [folder]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAssets() {
    if (!folder) return
    setLoading(true)
    const { data } = await supabase.storage
      .from('editor-assets')
      .list(folder, { limit: 200 })

    if (data) {
      const items: Asset[] = await Promise.all(
        data
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(async f => {
            const fullPath = `${folder}/${f.name}`
            const { data: urlData } = supabase.storage.from('editor-assets').getPublicUrl(fullPath)
            return {
              name: f.name,
              fullPath,
              publicUrl: urlData.publicUrl,
              size: f.metadata?.size ?? 0,
              mimeType: f.metadata?.mimetype ?? '',
            }
          })
      )
      setAssets(items)
    }
    setLoading(false)
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !folder || !user) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const path = `${folder}/${safeName}`
      await supabase.storage.from('editor-assets').upload(path, file, {
        contentType: file.type,
        upsert: false,
      })
    }
    setUploading(false)
    loadAssets()
  }

  async function handleDelete(asset: Asset) {
    if (!confirm(`Delete ${asset.name}?`)) return
    await supabase.storage.from('editor-assets').remove([asset.fullPath])
    setAssets(prev => prev.filter(a => a.fullPath !== asset.fullPath))
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 1800)
  }

  if (!projectId) {
    return (
      <div className="asset-empty">
        <p>Save your project first<br />to upload assets.</p>
      </div>
    )
  }

  if (!user) return null

  const images = assets.filter(a => a.mimeType.startsWith('image/'))
  const audio = assets.filter(a => a.mimeType.startsWith('audio/'))

  return (
    <div className="asset-panel">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*"
        style={{ display: 'none' }}
        onChange={e => handleUpload(e.target.files)}
      />

      <div className="asset-upload-row">
        <button
          className="asset-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '+ Upload file'}
        </button>
      </div>

      {loading ? (
        <div className="asset-loading">Loading…</div>
      ) : assets.length === 0 ? (
        <div className="asset-empty">
          <p>No assets yet.<br />Upload sprites or audio files.</p>
        </div>
      ) : (
        <div className="asset-list">
          {images.length > 0 && (
            <div className="asset-group">
              <div className="asset-group-label">Images</div>
              {images.map(a => (
                <AssetRow key={a.fullPath} asset={a} copied={copied === a.publicUrl} onCopy={handleCopy} onDelete={handleDelete} />
              ))}
            </div>
          )}
          {audio.length > 0 && (
            <div className="asset-group">
              <div className="asset-group-label">Audio</div>
              {audio.map(a => (
                <AssetRow key={a.fullPath} asset={a} copied={copied === a.publicUrl} onCopy={handleCopy} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AssetRow({ asset, copied, onCopy, onDelete }: {
  asset: Asset
  copied: boolean
  onCopy: (url: string) => void
  onDelete: (a: Asset) => void
}) {
  const isImage = asset.mimeType.startsWith('image/')
  const isAudio = asset.mimeType.startsWith('audio/')

  return (
    <div className="asset-row">
      <div className="asset-thumb">
        {isImage ? (
          <img src={asset.publicUrl} alt={asset.name} />
        ) : isAudio ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10V6l9-3v4M3 10a2 2 0 1 1-2-2 2 2 0 0 1 2 2zM12 7a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1" y="1" width="9" height="12" rx="1" /><path d="M8 1v4h4" />
          </svg>
        )}
      </div>
      <div className="asset-info">
        <span className="asset-name" title={asset.name}>{asset.name}</span>
        <span className="asset-size">{formatSize(asset.size)}</span>
      </div>
      <div className="asset-actions">
        <button
          className={`asset-action-btn${copied ? ' copied' : ''}`}
          onClick={() => onCopy(asset.publicUrl)}
          title={copied ? 'Copied!' : 'Copy URL'}
        >
          {copied ? (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="4" y="4" width="7" height="7" rx="1" />
              <path d="M8 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1" />
            </svg>
          )}
        </button>
        <button className="asset-action-btn danger" onClick={() => onDelete(asset)} title="Delete">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 3h8M5 3V2h2v1M4 3l.5 7h3L8 3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
