import { DrawingCanvas } from './DrawingCanvas'
import { useCanvasStore } from '../store/useCanvasStore'

export function CanvasArea() {
  const shapesCount = useCanvasStore((s) => s.shapes.length)
  const tool = useCanvasStore((s) => s.tool)

  return (
    <main
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <DrawingCanvas />

      {shapesCount === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-xl border px-8 py-6 text-center"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border)',
              maxWidth: 360,
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Draw your idea
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Current tool: <strong style={{ color: 'var(--text)' }}>{tool}</strong>
              <br />
              Pen, shapes, frames — then hit Generate later.
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
