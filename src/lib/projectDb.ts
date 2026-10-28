import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Role } from '../store/useProjectStore'
import type { Shape } from '../store/useCanvasStore'
import type { DesignTree } from '../types/designTree'

export interface StoredProject {
  id: string
  title: string
  role: Role
  shapes: Shape[]
  designTree: DesignTree | null
  createdAt: string
  updatedAt: string
  thumbnail?: string | null
}

interface SketchForgeDB extends DBSchema {
  projects: {
    key: string
    value: StoredProject
    indexes: { 'by-updated': string }
  }
  meta: {
    key: string
    value: { key: string; value: string }
  }
}

const DB_NAME = 'sketchforge-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<SketchForgeDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<SketchForgeDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('projects')) {
          const store = db.createObjectStore('projects', { keyPath: 'id' })
          store.createIndex('by-updated', 'updatedAt')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

export async function listProjects(): Promise<StoredProject[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('projects', 'by-updated')
  return all.reverse()
}

export async function getProject(id: string): Promise<StoredProject | undefined> {
  const db = await getDb()
  return db.get('projects', id)
}

export async function saveProject(project: StoredProject): Promise<void> {
  const db = await getDb()
  await db.put('projects', {
    ...project,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('projects', id)
}

export async function getMeta(key: string): Promise<string | null> {
  const db = await getDb()
  const row = await db.get('meta', key)
  return row?.value ?? null
}

export async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb()
  await db.put('meta', { key, value })
}

export function newProjectId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyProject(title = 'Untitled project', role: Role = 'developer'): StoredProject {
  const now = new Date().toISOString()
  return {
    id: newProjectId(),
    title,
    role,
    shapes: [],
    designTree: null,
    createdAt: now,
    updatedAt: now,
    thumbnail: null,
  }
}
