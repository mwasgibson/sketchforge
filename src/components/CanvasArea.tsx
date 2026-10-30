import { DrawingCanvas } from './DrawingCanvas'
import { useCanvasStore } from '../store/useCanvasStore'
import { useProjectStore } from '../store/useProjectStore'

export function CanvasArea() {
  const shapesCount = useCanvasStore((s) => s.shapes.length)
  const tool = useCanvasStore((s) => s.tool)
  const scale = useCanvasStore((s) => s.scale)
  const role = useProjectStore((s) => s.role)

  return (
    <main
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <div className="sf-grid" aria-hidden />

      <DrawingCanvas />

      <div
        className="pointer-events-none absolute bottom-3 left-3 rounded-md px-2 py-1 text-[10px] tabular-nums"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {Math.round(scale * 100)}%
      </div>

      {shapesCount === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="sf-empty">
            <div
              className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
            >
              ✎
            </div>
            <p className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
              Sketch your idea
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>
              Tool: <span style={{ color: 'var(--text)' }}>{tool}</span>
              <span style={{ color: 'var(--text-muted)' }}> · </span>
              Role: <span style={{ color: 'var(--text)' }}>{role}</span>
            </p>
            <p className="mt-3 text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Draw freehand or drop frames, then hit <strong style={{ color: 'var(--text-soft)' }}>Generate</strong> to polish.
              <br />
              Shortcuts: V select · P pen · R rect · T text · ⌘Z undo
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
