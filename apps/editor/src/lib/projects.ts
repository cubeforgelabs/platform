import { supabase } from './supabase'
import type { VFile } from '../templates'

export interface ProjectData {
  files: VFile[]
  templateId: string
}

export async function saveProject(projectId: string | null, name: string, data: ProjectData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (projectId) {
    const { data: updated } = await supabase
      .from('projects')
      .update({ name, data: data as never, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select('id')
      .single()
    return updated?.id ?? null
  } else {
    const { data: created } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name, data: data as never })
      .select('id')
      .single()
    return created?.id ?? null
  }
}

export async function loadProject(projectId: string) {
  const { data } = await supabase
    .from('projects')
    .select('id, name, data')
    .eq('id', projectId)
    .single()
  return data as { id: string; name: string; data: ProjectData } | null
}

export async function listProjects() {
  const { data } = await supabase
    .from('projects')
    .select('id, name, updated_at')
    .order('updated_at', { ascending: false })
  return data ?? []
}
