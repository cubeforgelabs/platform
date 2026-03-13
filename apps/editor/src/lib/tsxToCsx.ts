/**
 * Parse a csxToTsx-generated main.tsx back into CsxDocument fields.
 * Only handles the deterministic format produced by csxToTsx — not arbitrary TSX.
 * Returns null if the file doesn't look like CSX-generated code.
 */
import type { CsxDocument, CsxEntity, CsxComponent, CsxGame, CsxWorld } from './csx'

// ── Prop parser ───────────────────────────────────────────────────────────────
// Handles: key={expr}, key="str", key (bare boolean)

function parseProps(src: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  let i = 0

  function skipWs() { while (i < src.length && /\s/.test(src[i])) i++ }

  while (i < src.length) {
    skipWs()
    if (i >= src.length) break

    // Read key
    if (!/[a-zA-Z_$]/.test(src[i])) { i++; continue }
    let key = ''
    while (i < src.length && /[a-zA-Z0-9_$]/.test(src[i])) key += src[i++]
    if (!key) continue

    skipWs()

    if (src[i] !== '=') {
      result[key] = true
      continue
    }
    i++ // skip '='
    skipWs()

    if (src[i] === '"') {
      i++
      let val = ''
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '\\') { i++; val += src[i++] } else val += src[i++]
      }
      i++ // closing "
      result[key] = val
    } else if (src[i] === '{') {
      i++ // skip {
      let depth = 1
      let val = ''
      while (i < src.length && depth > 0) {
        if (src[i] === '{') depth++
        else if (src[i] === '}') { depth--; if (depth === 0) { i++; break } }
        val += src[i++]
      }
      const t = val.trim()
      if (t === 'true') result[key] = true
      else if (t === 'false') result[key] = false
      else if (/^-?\d+(\.\d+)?$/.test(t)) result[key] = Number(t)
      else { try { result[key] = JSON.parse(t) } catch { result[key] = t } }
    }
  }
  return result
}

// ── Tag extractor ─────────────────────────────────────────────────────────────
// Returns { tagName, propsStr, selfClosing, afterIndex }

interface TagMatch {
  tagName: string
  propsStr: string
  selfClosing: boolean
  start: number
  end: number   // index after the closing > or />
}

function findNextTag(src: string, from: number): TagMatch | null {
  const re = /<([A-Z][a-zA-Z0-9]*)((?:\s[^>]*?)?)\s*(\/?)>/gs
  re.lastIndex = from
  const m = re.exec(src)
  if (!m) return null
  return {
    tagName: m[1],
    propsStr: m[2],
    selfClosing: m[3] === '/',
    start: m.index,
    end: re.lastIndex,
  }
}

// Find the matching closing tag, handling nesting. Returns index after </tagName>
function findClosingTag(src: string, tagName: string, from: number): number {
  let depth = 1
  let i = from
  while (i < src.length && depth > 0) {
    const openRe = new RegExp(`<${tagName}[\\s>]`, 'g')
    const closeRe = new RegExp(`<\\/${tagName}>`, 'g')
    openRe.lastIndex = i
    closeRe.lastIndex = i
    const openM = openRe.exec(src)
    const closeM = closeRe.exec(src)
    if (!closeM) return src.length
    if (openM && openM.index < closeM.index) {
      depth++
      i = openM.index + openM[0].length
    } else {
      depth--
      i = closeM.index + closeM[0].length
      if (depth === 0) return i
    }
  }
  return i
}

// ── Entity parser ─────────────────────────────────────────────────────────────

function parseEntity(src: string, tagMatch: TagMatch): { entity: CsxEntity; end: number } {
  const props = parseProps(tagMatch.propsStr)
  const id = `e_${Math.random().toString(36).slice(2, 9)}`
  const entity: CsxEntity = {
    id,
    name: String(props.name ?? 'Entity'),
    x: Number(props.x ?? 0),
    y: Number(props.y ?? 0),
    components: [],
    children: [],
  }

  if (tagMatch.selfClosing) return { entity, end: tagMatch.end }

  // Parse children (components and nested entities)
  const closingEnd = findClosingTag(src, 'Entity', tagMatch.end)
  const inner = src.slice(tagMatch.end, closingEnd - `</Entity>`.length)

  let i = 0
  while (i < inner.length) {
    const tag = findNextTag(inner, i)
    if (!tag) break

    if (tag.tagName === 'Entity') {
      const child = parseEntity(inner, tag)
      entity.children.push(child.entity)
      i = child.end
    } else {
      // It's a component
      const compProps = parseProps(tag.propsStr)
      entity.components.push({ type: tag.tagName, props: compProps })
      i = tag.end
      if (!tag.selfClosing) {
        // Skip to closing tag
        i = findClosingTag(inner, tag.tagName, tag.end) - (`</${tag.tagName}>`).length
        i += (`</${tag.tagName}>`).length
      }
    }
  }

  return { entity, end: closingEnd }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function isCsxGeneratedCode(mainTsx: string): boolean {
  return (
    mainTsx.includes("from 'cubeforge'") &&
    mainTsx.includes('<Game ') &&
    mainTsx.includes('<World ') &&
    !mainTsx.includes('createRoot')
  )
}

export function tsxToCsx(mainTsx: string, base: CsxDocument): CsxDocument {
  const doc = { ...base, entities: [] as CsxEntity[] }

  // Parse <Game ...>
  const gameM = mainTsx.match(/<Game\s([^>]*?)(?:\s*\/?>)/)
  if (gameM) {
    const gp = parseProps(gameM[1]) as Partial<CsxGame>
    doc.game = {
      width:   typeof gp.width   === 'number' ? gp.width   : base.game.width,
      height:  typeof gp.height  === 'number' ? gp.height  : base.game.height,
      gravity: typeof gp.gravity === 'number' ? gp.gravity : base.game.gravity,
      debug:   typeof gp.debug   === 'boolean' ? gp.debug  : base.game.debug,
    }
  }

  // Parse <World ...>
  const worldM = mainTsx.match(/<World\s([^>]*?)>/)
  if (worldM) {
    const wp = parseProps(worldM[1]) as Partial<CsxWorld>
    doc.world = {
      background: typeof wp.background === 'string' ? wp.background : base.world.background,
    }
  }

  // Parse entities inside <World>
  const worldStart = mainTsx.indexOf('<World')
  const worldOpenEnd = mainTsx.indexOf('>', worldStart) + 1
  const worldClose = findClosingTag(mainTsx, 'World', worldOpenEnd)
  const worldInner = mainTsx.slice(worldOpenEnd, worldClose - '</World>'.length)

  const entities: CsxEntity[] = []
  let i = 0
  while (i < worldInner.length) {
    const tag = findNextTag(worldInner, i)
    if (!tag) break
    if (tag.tagName === 'Entity') {
      const { entity, end } = parseEntity(worldInner, tag)
      entities.push(entity)
      i = end
    } else {
      i = tag.end
    }
  }

  doc.entities = entities
  return doc
}
