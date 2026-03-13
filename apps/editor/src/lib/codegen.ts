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

function genEntity(entity: CsxEntity, depth = 2, scriptImports: string[]): string {
  const indent = '  '.repeat(depth)
  const scriptComp = entity.components.find(c => c.type === 'Script')
  const scriptFile = scriptComp?.props.file as string | undefined
  const importName = safeIdent(entity.name)

  if (scriptFile) {
    scriptImports.push(`import ${importName} from './${scriptFile.replace(/\.tsx$/, '')}'`)
  }

  const comps = entity.components
    .filter(c => c.type !== 'Script')
    .map(c => `${indent}  ${genComponent(c)}`)
    .join('\n')

  const children = entity.children.map(e => genEntity(e, depth + 1, scriptImports)).join('\n')

  const scriptLine = scriptFile ? `\n${indent}  <Script component={${importName}} />` : ''
  const inner = [comps, children].filter(Boolean).join('\n')
  const body = inner + scriptLine

  const attrs = `name="${entity.name}" x={${entity.x}} y={${entity.y}}`
  if (body.trim()) {
    return `${indent}<Entity ${attrs}>\n${body}\n${indent}</Entity>`
  }
  return `${indent}<Entity ${attrs} />`
}

export function csxToTsx(doc: CsxDocument): VFile[] {
  const usedTypes = new Set<string>(['Entity'])
  const scriptImports: string[] = []

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

  const mainTsx = `import { ${imports.join(', ')} } from 'cubeforge'
${scriptImports.join('\n')}

export default function App() {
  return (
    <Game width={${doc.game.width}} height={${doc.game.height}} gravity={${doc.game.gravity}}${doc.game.debug ? ' debug' : ''}>
      <World background="${doc.world.background}">
${entitiesCode}
      </World>
    </Game>
  )
}
`

  const otherFiles = doc.files.filter(f => f.name !== 'main.tsx')
  return [{ name: 'main.tsx', content: mainTsx }, ...otherFiles]
}
