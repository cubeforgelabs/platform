import type { CsxDocument, CsxEntity, CsxComponent } from './csx'
import { COMPONENT_REGISTRY } from './componentRegistry'
import type { VFile } from '../templates'

function sp(props: Record<string, unknown>): string {
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => {
      if (typeof v === 'boolean') return v ? k : `${k}={false}`
      if (typeof v === 'number') return `${k}={${v}}`
      if (typeof v === 'string') return `${k}="${v}"`
      return `${k}={${JSON.stringify(v)}}`
    })
    .join(' ')
}

function genComponent(comp: CsxComponent): string {
  const def = COMPONENT_REGISTRY[comp.type]
  if (def) return def.codegen(comp.props)
  return `<${comp.type} ${sp(comp.props)} />`
}

function safeIdent(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/^(\d)/, '_$1')
}

// Returns the import identifier for a script file (based on file name, not entity name)
// This ensures the identifier matches the actual exported function name in the file,
// which makes the bundle work correctly when local imports are dropped.
function scriptFileIdent(file: string): string {
  return safeIdent(file.replace(/\.[^.]+$/, ''))
}

function genEntity(entity: CsxEntity, depth = 2, scriptImports: Set<string>): string {
  const indent = '  '.repeat(depth)
  const scriptComp = entity.components.find(c => c.type === 'Script')
  const scriptFile = scriptComp?.props.file as string | undefined

  if (scriptFile) {
    const importName = scriptFileIdent(scriptFile)
    scriptImports.add(`import ${importName} from './${scriptFile.replace(/\.[^.]+$/, '')}'`)
  }

  const comps = entity.components
    .filter(c => c.type !== 'Script')
    .map(c => `${indent}  ${genComponent(c)}`)
    .join('\n')

  const children = entity.children.map(e => genEntity(e, depth + 1, scriptImports)).join('\n')

  // Render the controller as a direct child component, NOT wrapped in <Script component>.
  // Wrapping in Script would register an undefined update function and crash the engine.
  const scriptLine = scriptFile
    ? `\n${indent}  <${scriptFileIdent(scriptFile)} />`
    : ''
  const inner = [comps, children].filter(Boolean).join('\n')
  const body = inner + scriptLine

  // Use lowercased safeIdent as entity id so followEntity / tag lookups work by name
  const entityId = safeIdent(entity.name).toLowerCase()
  const attrs = `id="${entityId}" name="${entity.name}" x={${entity.x}} y={${entity.y}}`
  if (body.trim()) {
    return `${indent}<Entity ${attrs}>\n${body}\n${indent}</Entity>`
  }
  return `${indent}<Entity ${attrs} />`
}

export function csxToTsx(doc: CsxDocument): VFile[] {
  // If there are no entities, preserve the existing main.tsx from doc.files (e.g. code-only templates)
  const existingMain = doc.files.find(f => f.name === 'main.tsx')
  if (doc.entities.length === 0 && existingMain) {
    return doc.files
  }

  const usedTypes = new Set<string>(['Entity'])
  const scriptImports = new Set<string>()

  function collectTypes(entities: CsxEntity[]) {
    for (const e of entities) {
      for (const c of e.components) {
        if (c.type !== 'Script') usedTypes.add(c.type)
      }
      collectTypes(e.children)
    }
  }
  collectTypes(doc.entities)

  const entitiesCode = doc.entities.map(e => genEntity(e, 2, scriptImports)).join('\n')
  const imports = [...new Set(['Game', 'World', ...Array.from(usedTypes)])]

  const mainTsx = `// @cubeforge-csx
import { ${imports.join(', ')} } from 'cubeforge'
import { createRoot } from 'react-dom/client'
${[...scriptImports].join('\n')}

function App() {
  return (
    <Game width={${doc.game.width}} height={${doc.game.height}} gravity={${doc.game.gravity}}${doc.game.debug ? ' debug' : ''}>
      <World background="${doc.world.background}">
${entitiesCode}
      </World>
    </Game>
  )
}

createRoot(document.getElementById('root')).render(<App />)
`

  const otherFiles = doc.files.filter(f => f.name !== 'main.tsx')
  return [{ name: 'main.tsx', content: mainTsx }, ...otherFiles]
}
