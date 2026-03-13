export const CSX_VERSION = '1.0' as const

export interface CsxDocument {
  $csx: typeof CSX_VERSION
  meta: CsxMeta
  game: CsxGame
  world: CsxWorld
  entities: CsxEntity[]
  files: CsxFile[]
}

export interface CsxMeta {
  name: string
  created_at: string
  updated_at: string
  game_id?: string // set after first publish
}

export interface CsxGame {
  width: number
  height: number
  gravity: number
  debug: boolean
}

export interface CsxWorld {
  background: string
}

export interface CsxEntity {
  id: string
  name: string
  x: number
  y: number
  components: CsxComponent[]
  children: CsxEntity[]
}

export interface CsxComponent {
  type: string
  props: Record<string, unknown>
}

export interface CsxFile {
  name: string
  content: string
}

export function createEmptyDocument(name: string): CsxDocument {
  const now = new Date().toISOString()
  return {
    $csx: CSX_VERSION,
    meta: { name, created_at: now, updated_at: now },
    game: { width: 900, height: 560, gravity: 980, debug: false },
    world: { background: '#12131f' },
    entities: [],
    files: [],
  }
}

export function createEntity(name: string, x = 100, y = 100): CsxEntity {
  return {
    id: `e_${Math.random().toString(36).slice(2, 9)}`,
    name,
    x,
    y,
    components: [],
    children: [],
  }
}

/** Upgrade old { files, templateId } project data to CsxDocument */
export function upgradeProjectData(data: unknown): CsxDocument {
  const d = data as Record<string, unknown>
  if (d.$csx) return d as unknown as CsxDocument
  // Old format: { files: VFile[], templateId: string }
  const files = (d.files as Array<{ name: string; content: string }>) ?? []
  const doc = createEmptyDocument('Untitled')
  doc.files = files
  return doc
}
