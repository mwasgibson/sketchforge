import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { LeftRail } from './components/LeftRail'
import { CanvasArea } from './components/CanvasArea'
import { RightRail } from './components/RightRail'
import { GenerateOverlay } from './components/GenerateOverlay'
import { AutoSave } from './components/AutoSave'
import { useProjectStore } from './store/useProjectStore'
import { useCanvasStore, type Tool } from './store/useCanvasStore'
import { useDesignStore } from './store/useDesignStore'
import type { StoredProject } from './lib/projectDb'

function applyProject(p: StoredProject) {
  useCanvasStore.getState().loadShapes(p.shapes || [])
  useDesignStore.setState({
    designTree: p.designTree,
    mode: p.designTree ? 'polished' : 'sketch',
    selectedNodeId: p.designTree?.root.id ?? null,
  })
}

function App() {
  const theme = useProjectStore((s) => s.theme)
  const hydrateFromDb = useProjectStore((s) => s.hydrateFromDb)
  const hydrated = useProjectStore((s) => s.hydrated)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    void hydrateFromDb(applyProject)
  }, [hydrateFromDb])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const meta = e.metaKey || e.ctrlKey
      const store = useCanvasStore.getState()

      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        store.undo()
        return
      }
      if (meta && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        store.redo()
        return
      }
      if (meta && e.key === 's') {
        e.preventDefault()
        const ps = useProjectStore.getState()
        void ps.saveCurrent({
          title: ps.projectName,
          role: ps.role,
          shapes: useCanvasStore.getState().shapes,
          designTree: useDesignStore.getState().designTree,
        })
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        store.deleteSelected()
        return
      }

      const map: Record<string, Tool> = {
        v: 'select',
        p: 'pen',
        e: 'eraser',
        r: 'rect',
        o: 'ellipse',
        l: 'line',
        t: 'text',
        f: 'frame',
        h: 'pan',
      }
      const tool = map[e.key.toLowerCase()]
      if (tool && !meta) {
        e.preventDefault()
        store.setTool(tool)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading projects…
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col">
      <AutoSave />
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <LeftRail />
        <CanvasArea />
        <RightRail />
        <GenerateOverlay />
      </div>
    </div>
  )
}

export default App
