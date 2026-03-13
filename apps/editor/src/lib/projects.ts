import { supabase } from './supabase'
import { upgradeProjectData, type CsxDocument } from './csx'
import {
  isLocalId, newLocalId, localSave, localLoad, localList, localDelete,
  type LocalProject,
} from './localProjects'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProjectSummary {
  id: string
  name: string
  updated_at: string
  thumbnail_url: string | null
  local?: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ── Save ───────────────────────────────────────────────────────────────────

export async function saveProject(
  projectId: string | null,
  name: string,
  doc: CsxDocument,
): Promise<string | null> {
  const payload = { ...doc, meta: { ...doc.meta, name, updated_at: new Date().toISOString() } }
  const now = new Date().toISOString()

  // Local project (guest or existing local id)
  if (projectId && isLocalId(projectId)) {
    await localSave({ id: projectId, name, data: payload, updated_at: now, thumbnail_url: null })
    return projectId
  }

  const user = await getUser()

  // No user and no existing remote id → save locally
  if (!user) {
    const id = projectId ?? newLocalId()
    await localSave({ id, name, data: payload, updated_at: now, thumbnail_url: null })
    return id
  }

  // Authenticated — save to Supabase
  if (projectId) {
    const { data } = await supabase
      .from('projects')
      .update({ name, data: payload as never, updated_at: now })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select('id')
      .single()
    return data?.id ?? null
  } else {
    const { data } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name, data: payload as never })
      .select('id')
      .single()
    return data?.id ?? null
  }
}

// ── Load ───────────────────────────────────────────────────────────────────

export async function loadProject(
  projectId: string,
): Promise<{ id: string; name: string; doc: CsxDocument } | null> {
  if (isLocalId(projectId)) {
    const local = await localLoad(projectId)
    if (!local) return null
    return { id: local.id, name: local.name, doc: upgradeProjectData(local.data) }
  }

  const { data } = await supabase
    .from('projects')
    .select('id, name, data')
    .eq('id', projectId)
    .single()
  if (!data) return null
  return { id: data.id, name: data.name, doc: upgradeProjectData(data.data) }
}

// ── List ───────────────────────────────────────────────────────────────────

export async function listProjects(): Promise<ProjectSummary[]> {
  const user = await getUser()

  if (!user) {
    return (await localList()).map(p => ({ ...p, local: true }))
  }

  const { data } = await supabase
    .from('projects')
    .select('id, name, updated_at, thumbnail_url')
    .order('updated_at', { ascending: false })
  return (data ?? []).map(p => ({ ...p, local: false }))
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createProject(name: string, doc: CsxDocument): Promise<string | null> {
  const user = await getUser()
  const now = new Date().toISOString()

  if (!user) {
    const id = newLocalId()
    await localSave({ id, name, data: doc, updated_at: now, thumbnail_url: null })
    return id
  }

  const { data } = await supabase
    .from('projects')
    .insert({ user_id: user.id, name, data: doc as never })
    .select('id')
    .single()
  return data?.id ?? null
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteProject(projectId: string): Promise<void> {
  if (isLocalId(projectId)) {
    await localDelete(projectId)
    return
  }
  await supabase.from('projects').delete().eq('id', projectId)
}

// ── Sync local → Supabase ──────────────────────────────────────────────────

export interface SyncResult {
  synced: number
  failed: number
  idMap: Record<string, string> // local id → remote id
}

export async function syncLocalProjects(): Promise<SyncResult> {
  const user = await getUser()
  if (!user) return { synced: 0, failed: 0, idMap: {} }

  const locals = await localList()
  if (locals.length === 0) return { synced: 0, failed: 0, idMap: {} }

  const idMap: Record<string, string> = {}
  let synced = 0
  let failed = 0

  for (const local of locals) {
    try {
      const { data } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name: local.name, data: local.data as never })
        .select('id')
        .single()
      if (data?.id) {
        idMap[local.id] = data.id
        await localDelete(local.id)
        synced++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { synced, failed, idMap }
}
