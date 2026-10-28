import { useProjectStore } from '../store/useProjectStore'
import type { StoredProject } from '../lib/projectDb'
import { useCanvasStore } from '../store/useCanvasStore'
import { useDesignStore } from '../store/useDesignStore'

interface Props {
  open: boolean
  onClose: () => void
}

function applyProject(p: StoredProject) {
  useCanvasStore.getState().loadShapes(p.shapes || [])
  useDesignStore.setState({
    designTree: p.designTree,
    mode: p.designTree ? 'polished' : 'sketch',
    selectedNodeId: p.designTree?.root.id ?? null,
  })
}

function snapshot() {
  return {
    title: useProjectStore.getState().projectName,
    role: useProjectStore.getState().role,
    shapes: useCanvasStore.getState().shapes,
    designTree: useDesignStore.getState().designTree,
  }
}

export function ProjectsModal({ open, onClose }: Props) {
  const projects = useProjectStore((s) => s.projects)
  const projectId = useProjectStore((s) => s.projectId)
  const refreshProjects = useProjectStore((s) => s.refreshProjects)
  const loadProject = useProjectStore((s) => s.loadProject)
  const createProject = useProjectStore((s) => s.createProject)
  const removeProject = useProjectStore((s) => s.removeProject)
  const duplicateProject = useProjectStore((s) => s.duplicateProject)
  const saveCurrent = useProjectStore((s) => s.saveCurrent)

  if (!open) return null

  const onOpen = async (id: string) => {
    await saveCurrent({
      ...snapshot(),
      thumbnail: null,
    })
    await loadProject(id, applyProject)
    onClose()
  }

  const onNew = async () => {
    await saveCurrent({ ...snapshot(), thumbnail: null })
    await createProject(applyProject)
    onClose()
  }

  const onDuplicate = async () => {
    await duplicateProject(snapshot(), applyProject)
    onClose()
  }

  const onDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project permanently?')) return
    await removeProject(id, applyProject)
    await refreshProjects()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Projects
          </h2>
          <button type="button" onClick={onClose} className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Close
          </button>
        </div>

        <div className="flex gap-2 border-b px-4 py-2" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onNew}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-white"
            style={{ background: 'var(--accent)' }}
          >
            New project
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded px-3 py-1.5 text-xs"
            style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            Duplicate current
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {projects.length === 0 && (
            <p className="px-2 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No saved projects yet.
            </p>
          )}
          {projects.map((p) => {
            const active = p.id === projectId
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpen(p.id)}
                className="mb-1 flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left"
                style={{
                  background: active ? 'var(--bg-panel)' : 'transparent',
                  border: active ? '1px solid var(--accent)' : '1px solid transparent',
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: 'var(--text)' }}>
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {p.role} · {p.shapes?.length ?? 0} layers ·{' '}
                    {new Date(p.updatedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => onDelete(p.id, e)}
                  onKeyDown={(e) => e.key === 'Enter' && onDelete(p.id, e as unknown as React.MouseEvent)}
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px]"
                  style={{ color: 'var(--error)' }}
                  title="Delete"
                >
                  Delete
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
