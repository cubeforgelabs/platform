import { supabase } from './supabase'
import { csxToTsx } from './codegen'
import { bundle, compile, buildIframeSrcdoc } from '../compiler'
import type { CsxDocument } from './csx'

export interface PublishMeta {
  title: string
  description: string
  tags: string[]
  thumbnailUrl?: string
  isPublic: boolean
}

export interface PublishResult {
  gameId: string
  url: string
}

export async function publishProject(
  doc: CsxDocument,
  meta: PublishMeta,
  userId: string,
): Promise<PublishResult> {
  // 1. Code-gen → compile → bundle
  const files = csxToTsx(doc)
  const source = bundle(files)
  const result = compile(source)
  if (result.error !== null) throw new Error(`Build failed: ${result.error}`)

  const html = buildIframeSrcdoc(result.code)
  const blob = new Blob([html], { type: 'text/html' })

  // 2. Determine game_id — reuse if already published, otherwise generate
  const gameId = doc.meta.game_id ?? crypto.randomUUID()

  // 3. Upload bundle to games/{game_id}/index.html
  const { error: uploadError } = await supabase.storage
    .from('games')
    .upload(`${gameId}/index.html`, blob, {
      contentType: 'text/html',
      upsert: true,
      cacheControl: '0',
    })
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const bundlePath = `${gameId}/index.html`

  // 4. Upsert games table
  const { error: dbError } = await supabase.from('games').upsert({
    id: gameId,
    title: meta.title,
    description: meta.description || null,
    tags: meta.tags,
    thumbnail_url: meta.thumbnailUrl || null,
    bundle_path: bundlePath,
    author_id: userId,
    is_official: false,
    published_at: new Date().toISOString(),
  })
  if (dbError) throw new Error(`DB error: ${dbError.message}`)

  return {
    gameId,
    url: `https://play.cubeforge.dev/game/${gameId}`,
  }
}
