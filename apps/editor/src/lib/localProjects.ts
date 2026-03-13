import type { CsxDocument } from './csx'

const DB_NAME = 'cubeforge-editor'
const DB_VERSION = 1
const STORE = 'projects'

export interface LocalProject {
  id: string
  name: string
  data: CsxDocument
  updated_at: string
  thumbnail_url: null
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(db: IDBDatabase, mode: IDBTransactionMode) {
  return db.transaction(STORE, mode).objectStore(STORE)
}

function run<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export function isLocalId(id: string): boolean {
  return id.startsWith('local-')
}

export function newLocalId(): string {
  return `local-${crypto.randomUUID()}`
}

export async function localSave(project: LocalProject): Promise<void> {
  const db = await openDB()
  await run(tx(db, 'readwrite').put(project))
}

export async function localLoad(id: string): Promise<LocalProject | null> {
  const db = await openDB()
  return (await run<LocalProject | undefined>(tx(db, 'readonly').get(id))) ?? null
}

export async function localList(): Promise<LocalProject[]> {
  const db = await openDB()
  const all = await run<LocalProject[]>(tx(db, 'readonly').getAll())
  return all.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

export async function localDelete(id: string): Promise<void> {
  const db = await openDB()
  await run(tx(db, 'readwrite').delete(id))
}

export async function localCount(): Promise<number> {
  const db = await openDB()
  return run<number>(tx(db, 'readonly').count())
}
