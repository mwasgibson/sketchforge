import { useState } from 'react'
import { useProjectStore, type Role } from '../store/useProjectStore'
import { useCanvasStore } from '../store/useCanvasStore'
import { useDesignStore } from '../store/useDesignStore'
import { useGenerateStore } from '../store/useGenerateStore'
import { generatePolished } from '../lib/generate'
import { ExportModal } from './ExportModal'
import { ProjectsModal } from './ProjectsModal'

const ROLES: { id: Role; label: string }[] = [
  { id: 'developer', label: 'Developer' },
  { id: 'marketer', label: 'Marketer' },
  { id: 'designer', label: 'Designer' },
  { id: 'general', label: 'General' },
]

export function TopBar() {
  const { role, theme, projectName, setRole, setTheme, setProjectName } = useProjectStore()
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)
  const clearCanvas = useCanvasStore((s) => s.clearCanvas)
  const pastLen = useCanvasStore((s) => s.past.length)
  const futureLen = useCanvasStore((s) => s.future.length)
  const shapesLen = useCanvasStore((s) => s.shapes.length)
  const loadShapes = useCanvasStore((s) => s.loadShapes)
  const genStatus = useGenerateStore((s) => s.status)
  const [exportOpen, setExportOpen] = useState(false)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const saveStatus = useProjectStore((s) => s.saveStatus)

  const exportPng = () => {
    const fn = (window as unknown as { __sketchforgeExportPng?: () => string | null }).__sketchforgeExportPng
    const data = fn?.()
    if (!data) return
    const a = document.createElement('a')
    a.href = data
    a.download = `${projectName || 'sketch'}.png`
    a.click()
  }

  const exportJson = () => {
    const fn = (window as unknown as { __sketchforgeExportJson?: () => string }).__sketchforgeExportJson
    const data = fn?.()
    if (!data) return
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName || 'sketch'}.sketchforge.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAgent = () => {
    const data = useDesignStore.getState().getAgentPayloadJson()
    if (!data) {
      alert('Build a Design Tree first (Generate or right panel).')
      return
    }
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName || 'sketch'}.agent.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onGenerate = async () => {
    const shapes = useCanvasStore.getState().shapes
    if (shapes.length === 0) {
      useGenerateStore.getState().setError('Draw something first.')
      return
    }
    if (genStatus === 'generating' || genStatus === 'capturing') return

    const gen = useGenerateStore.getState()
    gen.setStatus('capturing', 'Capturing sketch…')

    try {
      const pngFn = (window as unknown as { __sketchforgeExportPng?: () => string | null }).__sketchforgeExportPng
      const pngDataUrl = pngFn?.() ?? null

      gen.setStatus('generating', 'Polishing design…')

      const result = await generatePolished({
        pngDataUrl,
        shapes,
        role,
        title: projectName || 'Untitled',
      })

      loadShapes(result.shapes)

      useDesignStore.setState({
        designTree: result.designTree,
        mode: 'polished',
        selectedNodeId: result.designTree.root.id,
      })

      gen.setLastSource(result.source)
      gen.setStatus('done', result.message || 'Done')
      setTimeout(() => {
        if (useGenerateStore.getState().status === 'done') gen.reset()
      }, 1200)
    } catch (err) {
      gen.setError(err instanceof Error ? err.message : 'Generation failed')
    }
  }

  const busy = genStatus === 'capturing' || genStatus === 'generating'

  return (
    <>
    <header
      className="flex h-12 shrink-0 items-center gap-3 border-b px-3"
      style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--accent)' }}>
          SketchForge
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          /
        </span>
        <input
          className="bg-transparent text-sm outline-none"
          style={{ color: 'var(--text)', minWidth: 100, maxWidth: 180 }}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          aria-label="Project name"
        />
        <span className="text-[10px]" style={{ color: 'var(--text-muted)', minWidth: 44 }}>
          {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : ''}
        </span>
        <button
          type="button"
          onClick={() => setProjectsOpen(true)}
          className="rounded px-2 py-1 text-xs"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          title="Open projects"
        >
          Projects
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button type="button" onClick={undo} disabled={pastLen === 0} className="rounded px-2 py-1 text-xs disabled:opacity-30" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} title="Undo">Undo</button>
        <button type="button" onClick={redo} disabled={futureLen === 0} className="rounded px-2 py-1 text-xs disabled:opacity-30" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} title="Redo">Redo</button>
        <button type="button" onClick={clearCanvas} disabled={shapesLen === 0} className="rounded px-2 py-1 text-xs disabled:opacity-30" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} title="Clear canvas">Clear</button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-1">
        {ROLES.map((r) => {
          const active = role === r.id
          const accent = r.id === 'developer' ? '#3b82f6' : r.id === 'marketer' ? '#f97316' : r.id === 'designer' ? '#a855f7' : 'var(--accent)'
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className="rounded px-2 py-1 transition-colors text-xs font-medium"
              style={{
                background: active ? accent : 'transparent',
                color: active ? '#fff' : 'var(--text-muted)',
              }}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-1">
        <button type="button" onClick={exportPng} className="rounded px-2 py-1 text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} title="Export PNG">PNG</button>
        <button type="button" onClick={exportJson} className="rounded px-2 py-1 text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} title="Export stroke/shape JSON">JSON</button>
        <button type="button" onClick={exportAgent} className="rounded px-2 py-1 text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} title="Export agent-ready Design Tree payload">Agent</button>
        <button type="button" onClick={() => setExportOpen(true)} className="rounded px-2 py-1 text-xs font-medium" style={{ color: 'var(--text)', border: '1px solid var(--border)' }} title="Role-specific exports">Export…</button>
      </div>

      <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded px-2 py-1 text-xs" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} aria-label="Toggle theme">{theme === 'dark' ? 'Light' : 'Dark'}</button>

      <button type="button" onClick={onGenerate} disabled={busy || shapesLen === 0} className="rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50" style={{ background: 'var(--accent)' }} title="Generate polished mockup from sketch">{busy ? 'Generating…' : 'Generate'}</button>
    </header>
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <ProjectsModal open={projectsOpen} onClose={() => setProjectsOpen(false)} />
    </>
  )
}
