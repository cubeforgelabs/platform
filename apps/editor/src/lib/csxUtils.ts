import type { CsxDocument, CsxEntity, CsxComponent } from './csx'

/** Find entity by id anywhere in tree */
export function findEntity(entities: CsxEntity[], id: string): CsxEntity | null {
  for (const e of entities) {
    if (e.id === id) return e
    const found = findEntity(e.children, id)
    if (found) return found
  }
  return null
}

/** Immutably update entity by id anywhere in tree */
export function updateEntity(
  entities: CsxEntity[],
  id: string,
  updater: (e: CsxEntity) => CsxEntity,
): CsxEntity[] {
  return entities.map(e => {
    if (e.id === id) return updater(e)
    return { ...e, children: updateEntity(e.children, id, updater) }
  })
}

/** Immutably remove entity by id anywhere in tree */
export function removeEntity(entities: CsxEntity[], id: string): CsxEntity[] {
  return entities
    .filter(e => e.id !== id)
    .map(e => ({ ...e, children: removeEntity(e.children, id) }))
}

/** Add component to entity */
export function addComponent(doc: CsxDocument, entityId: string, comp: CsxComponent): CsxDocument {
  return {
    ...doc,
    entities: updateEntity(doc.entities, entityId, e => ({
      ...e,
      components: [...e.components, comp],
    })),
  }
}

/** Remove component by index from entity */
export function removeComponent(doc: CsxDocument, entityId: string, compIndex: number): CsxDocument {
  return {
    ...doc,
    entities: updateEntity(doc.entities, entityId, e => ({
      ...e,
      components: e.components.filter((_, i) => i !== compIndex),
    })),
  }
}

/** Update a single prop on a component */
export function updateComponentProp(
  doc: CsxDocument,
  entityId: string,
  compIndex: number,
  key: string,
  value: unknown,
): CsxDocument {
  return {
    ...doc,
    entities: updateEntity(doc.entities, entityId, e => ({
      ...e,
      components: e.components.map((c, i) =>
        i === compIndex ? { ...c, props: { ...c.props, [key]: value } } : c
      ),
    })),
  }
}

/** Update entity position */
export function moveEntity(doc: CsxDocument, entityId: string, x: number, y: number): CsxDocument {
  return {
    ...doc,
    entities: updateEntity(doc.entities, entityId, e => ({ ...e, x: Math.round(x), y: Math.round(y) })),
  }
}

/** Update entity name */
export function renameEntity(doc: CsxDocument, entityId: string, name: string): CsxDocument {
  return {
    ...doc,
    entities: updateEntity(doc.entities, entityId, e => ({ ...e, name })),
  }
}

/** Collect all entity names for entity-ref dropdowns */
export function collectEntityNames(entities: CsxEntity[]): string[] {
  const names: string[] = []
  function walk(es: CsxEntity[]) {
    for (const e of es) { names.push(e.name); walk(e.children) }
  }
  walk(entities)
  return names
}

/** Touch updated_at */
export function touch(doc: CsxDocument): CsxDocument {
  return { ...doc, meta: { ...doc.meta, updated_at: new Date().toISOString() } }
}
