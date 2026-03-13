import { supabase } from './supabase'
import { upgradeProjectData, type CsxDocument } from './csx'

export async function saveProject(
  projectId: string | null,
  name: string,
  doc: CsxDocument,
): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const payload = { ...doc, meta: { ...doc.meta, name, updated_at: new Date().toISOString() } }

  if (projectId) {
    const { data } = await supabase
      .from('projects')
      .update({ name, data: payload as never, updated_at: new Date().toISOString() })
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

export async function loadProject(projectId: string): Promise<{ id: string; name: string; doc: CsxDocument } | null> {
  const { data } = await supabase
    .from('projects')
    .select('id, name, data')
    .eq('id', projectId)
    .single()
  if (!data) return null
  return { id: data.id, name: data.name, doc: upgradeProjectData(data.data) }
}

export async function listProjects(): Promise<Array<{ id: string; name: string; updated_at: string; thumbnail_url: string | null }>> {
  const { data } = await supabase
    .from('projects')
    .select('id, name, updated_at, thumbnail_url')
    .order('updated_at', { ascending: false })
  return data ?? []
}

export async function deleteProject(projectId: string): Promise<void> {
  await supabase.from('projects').delete().eq('id', projectId)
}

export async function createProject(name: string, doc: CsxDocument): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('projects')
    .insert({ user_id: user.id, name, data: doc as never })
    .select('id')
    .single()
  return data?.id ?? null
}
