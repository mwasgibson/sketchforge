import { useState } from 'react'
import { useProjectStore, type Role } from '../store/useProjectStore'
import { useCanvasStore, FRAME_PRESETS, type Tool } from '../store/useCanvasStore'

const TOOLS: { id: Tool; label: string; short: string }[] = [
  { id: 'select', label: 'Select (V)', short: 'Sel' },
  { id: 'pen', label: 'Pen (P)', short: 'Pen' },
  { id: 'eraser', label: 'Eraser (E)', short: 'Ers' },
  { id: 'rect', label: 'Rectangle (R)', short: 'Rect' },
  { id: 'ellipse', label: 'Ellipse (O)', short: 'Ell' },
  { id: 'line', label: 'Line (L)', short: 'Line' },
  { id: 'text', label: 'Text (T)', short: 'Txt' },
  { id: 'frame', label: 'Frame (F)', short: 'Frm' },
  { id: 'pan', label: 'Pan (H)', short: 'Pan' },
]

export function LeftRail() {
  const role = useProjectStore((s) => s.role)
  const tool = useCanvasStore((s) => s.tool)
  const setTool = useCanvasStore((s) => s.setTool)
  const strokeColor = useCanvasStore((s) => s.strokeColor)
  const setStrokeColor = useCanvasStore((s) => s.setStrokeColor)
  const strokeWidth = useCanvasStore((s) => s.strokeWidth)
  const setStrokeWidth = useCanvasStore((s) => s.setStrokeWidth)
  const addFrame = useCanvasStore((s) => s.addFrame)
  const [showFrames, setShowFrames] = useState(false)

  const frames = FRAME_PRESETS.filter((f) => f.roles.includes(role as Role) || f.roles.includes('general'))

  return (
    <aside
      className="flex w-14 flex-col items-center gap-0.5 border-r py-2"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
      aria-label="Tools"
    >
      {TOOLS.map((t) => {
        const active = tool === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTool(t.id)
              if (t.id === 'frame') setShowFrames((v) => !v)
              else setShowFrames(false)
            }}
            className="flex h-9 w-9 flex-col items-center justify-center rounded text-[9px] leading-tight transition-colors"
            style={{
              color: active ? '#fff' : 'var(--text-muted)',
              background: active ? 'var(--accent)' : 'transparent',
            }}
            title={t.label}
          >
            {t.short}
          </button>
        )
      })}

      <div className="my-2 h-px w-8" style={{ background: 'var(--border)' }} />

      <label className="flex flex-col items-center gap-0.5" title="Stroke color">
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </label>

      <input
        type="range"
        min={1}
        max={24}
        value={strokeWidth}
        onChange={(e) => setStrokeWidth(Number(e.target.value))}
        className="mt-1 w-10"
        title={`Stroke ${strokeWidth}px`}
      />

      {showFrames && (
        <div
          className="absolute left-16 top-24 z-20 max-h-64 w-40 overflow-auto rounded-lg border p-2 shadow-xl"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        >
          <p className="mb-1 px-1 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Frames · {role}
          </p>
          {frames.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                addFrame(f)
                setShowFrames(false)
                setTool('select')
              }}
              className="block w-full rounded px-2 py-1.5 text-left text-[11px] hover:opacity-90"
              style={{ color: 'var(--text)' }}
            >
              {f.label}
              <span className="ml-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {f.width}×{f.height}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-auto px-1 pb-2 text-center text-[9px]" style={{ color: 'var(--text-muted)' }}>
        {role.slice(0, 3)}
      </div>
    </aside>
  )
}
