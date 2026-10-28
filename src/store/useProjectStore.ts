import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Shape } from './useCanvasStore'
import type { DesignTree } from '../types/designTree'
import {
  listProjects,
  getProject,
  saveProject,
  deleteProject,
  getMeta,
  setMeta,
  createEmptyProject,
  type StoredProject,
} from '../lib/projectDb'

export type Role = 'developer' | 'marketer' | 'designer' | 'general'
export type Theme = 'dark' | 'light'

interface ProjectState {
  role: Role
  theme: Theme
  projectName: string
  projectId: string | null
  projects: StoredProject[]
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  hydrated: boolean

  setRole: (role: Role) => void
  setTheme: (theme: Theme) => void
  setProjectName: (name: string) => void
  setSaveStatus: (s: ProjectState['saveStatus']) => void

  refreshProjects: () => Promise<void>
  hydrateFromDb: (apply: (p: StoredProject) => void) => Promise<void>
  saveCurrent: (snapshot: {
    title: string
    role: Role
    shapes: Shape[]
    designTree: DesignTree | null
    thumbnail?: string | null
  }) => Promise<void>
  loadProject: (id: string, apply: (p: StoredProject) => void) => Promise<void>
  createProject: (apply: (p: StoredProject) => void) => Promise<void>
  removeProject: (id: string, apply: (p: StoredProject) => void) => Promise<void>
  duplicateProject: (
    snapshot: {
      title: string
      role: Role
      shapes: Shape[]
      designTree: DesignTree | null
    },
    apply: (p: StoredProject) => void
  ) => Promise<void>
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      role: 'developer',
      theme: 'dark',
      projectName: 'Untitled project',
      projectId: null,
      projects: [],
      saveStatus: 'idle',
      hydrated: false,

      setRole: (role) => set({ role }),
      setTheme: (theme) => set({ theme }),
      setProjectName: (projectName) => set({ projectName }),
      setSaveStatus: (saveStatus) => set({ saveStatus }),

      refreshProjects: async () => {
        const projects = await listProjects()
        set({ projects })
      },

      hydrateFromDb: async (apply) => {
        try {
          const projects = await listProjects()
          set({ projects })
          const lastId = await getMeta('lastProjectId')
          let project = lastId ? await getProject(lastId) : undefined
          if (!project && projects.length > 0) {
            project = projects[0]
          }
          if (!project) {
            project = createEmptyProject('Untitled project', get().role)
            await saveProject(project)
          }
          await setMeta('lastProjectId', project.id)
          set({
            projectId: project.id,
            projectName: project.title,
            role: project.role,
            hydrated: true,
          })
          apply(project)
          const refreshed = await listProjects()
          set({ projects: refreshed })
        } catch (e) {
          console.error('hydrateFromDb', e)
          const project = createEmptyProject()
          set({
            projectId: project.id,
            projectName: project.title,
            hydrated: true,
          })
          apply(project)
        }
      },

      saveCurrent: async (snapshot) => {
        const id = get().projectId
        if (!id) return
        set({ saveStatus: 'saving' })
        try {
          const existing = await getProject(id)
          const now = new Date().toISOString()
          const project: StoredProject = {
            id,
            title: snapshot.title,
            role: snapshot.role,
            shapes: snapshot.shapes,
            designTree: snapshot.designTree,
            thumbnail: snapshot.thumbnail ?? existing?.thumbnail ?? null,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          }
          await saveProject(project)
          await setMeta('lastProjectId', id)
          const projects = await listProjects()
          set({ projects, saveStatus: 'saved', projectName: snapshot.title, role: snapshot.role })
          setTimeout(() => {
            if (get().saveStatus === 'saved') set({ saveStatus: 'idle' })
          }, 1500)
        } catch (e) {
          console.error('saveCurrent', e)
          set({ saveStatus: 'error' })
        }
      },

      loadProject: async (id, apply) => {
        const project = await getProject(id)
        if (!project) return
        await setMeta('lastProjectId', id)
        set({
          projectId: project.id,
          projectName: project.title,
          role: project.role,
        })
        apply(project)
        const projects = await listProjects()
        set({ projects })
      },

      createProject: async (apply) => {
        const project = createEmptyProject('Untitled project', get().role)
        await saveProject(project)
        await setMeta('lastProjectId', project.id)
        set({
          projectId: project.id,
          projectName: project.title,
          role: project.role,
        })
        apply(project)
        const projects = await listProjects()
        set({ projects })
      },

      removeProject: async (id, apply) => {
        await deleteProject(id)
        let projects = await listProjects()
        if (get().projectId === id) {
          if (projects.length > 0) {
            const next = projects[0]
            await setMeta('lastProjectId', next.id)
            set({
              projectId: next.id,
              projectName: next.title,
              role: next.role,
              projects,
            })
            apply(next)
          } else {
            const project = createEmptyProject('Untitled project', get().role)
            await saveProject(project)
            await setMeta('lastProjectId', project.id)
            projects = await listProjects()
            set({
              projectId: project.id,
              projectName: project.title,
              role: project.role,
              projects,
            })
            apply(project)
          }
        } else {
          set({ projects })
        }
      },

      duplicateProject: async (snapshot, apply) => {
        const project = createEmptyProject(`${snapshot.title} copy`, snapshot.role)
        project.shapes = structuredClone(snapshot.shapes)
        project.designTree = snapshot.designTree
          ? structuredClone(snapshot.designTree)
          : null
        await saveProject(project)
        await setMeta('lastProjectId', project.id)
        set({
          projectId: project.id,
          projectName: project.title,
          role: project.role,
        })
        apply(project)
        const projects = await listProjects()
        set({ projects })
      },
    }),
    {
      name: 'sketchforge-ui',
      partialize: (s) => ({ theme: s.theme }),
    }
  )
)
