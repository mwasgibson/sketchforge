import { useState } from 'react'
import { useProjectStore, type Role } from '../store/useProjectStore'
import { useCanvasStore, FRAME_PRESETS, type Tool } from '../store/useCanvasStore'

const TOOLS: { id: Tool; label: string; glyph: string }[] = [
  { id: 'select', label: 'Select (V)', glyph: '↖' },
  { id: 'pen', label: 'Pen (P)', glyph: '✎' },
  { id: 'eraser', label: 'Eraser (E)', glyph: '⌫' },
  { id: 'rect', label: 'Rectangle (R)', glyph: '▭' },
  { id: 'ellipse', label: 'Ellipse (O)', glyph: '○' },
  { id: 'line', label: 'Line (L)', glyph: '/' },
  { id: 'text', label: 'Text (T)', glyph: 'T' },
  { id: 'frame', label: 'Frame (F)', glyph: '⬚' },
  { id: 'pan', label: 'Pan (H)', glyph: '✥' },
]

export function LeftRail() {
  const role = useProjectStore((s) => s.role)
  const tool = useCanvasStore((s) => s.tool)
  const setTool = useCanvasStore((s) => s.setTool)
  const strokeColor = useCanvasStore((s) => s.strokeColor)
  const setStrokeColor = useCanvasStore((s) => s.setStrokeColor)
  const strokeWidth = useCanvasStore((s) => s.strokeWidth)
  const setStrokeWidth = useCanvasStore((s) => s.setStrokeWidth)
  const fillColor = useCanvasStore((s) => s.fillColor)
  const setFillColor = useCanvasStore((s) => s.setFillColor)
  const addFrame = useCanvasStore((s) => s.addFrame)
  const [showFrames, setShowFrames] = useState(false)

  const frames = FRAME_PRESETS.filter(
    (f) => f.roles.includes(role as Role) || f.roles.includes('general'),
  )

  const roleColor =
    role === 'developer'
      ? 'var(--role-developer)'
      : role === 'marketer'
        ? 'var(--role-marketer)'
        : role === 'designer'
          ? 'var(--role-designer)'
          : 'var(--role-general)'

  return (
    <aside
      className="relative flex w-[52px] shrink-0 flex-col items-center gap-0.5 border-r py-2"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
      aria-label="Tools"
    >
      {TOOLS.map((t) => {
        const active = tool === t.id
        return (
          <button
            key={t.id}
            type="button"
            className="sf-tool"
            data-active={active}
            onClick={() => {
              setTool(t.id)
              if (t.id === 'frame') setShowFrames((v) => !v)
              else setShowFrames(false)
            }}
            title={t.label}
            aria-label={t.label}
            aria-pressed={active}
          >
            <span className="text-[13px] leading-none">{t.glyph}</span>
          </button>
        )
      })}

      <div className="my-2 h-px w-7" style={{ background: 'var(--border-subtle)' }} />

      <label className="flex flex-col items-center gap-0.5" title="Stroke color">
        <span className="sr-only">Stroke color</span>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent p-0"
          style={{ boxShadow: '0 0 0 1px var(--border)' }}
        />
      </label>

      <label className="mt-1 flex flex-col items-center gap-0.5" title="Fill color">
        <span className="sr-only">Fill color</span>
        <input
          type="color"
          value={fillColor === 'transparent' ? '#000000' : fillColor}
          onChange={(e) => setFillColor(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded-md border-0 bg-transparent p-0 opacity-80"
          style={{ boxShadow: '0 0 0 1px var(--border)' }}
        />
      </label>

      <input
        type="range"
        min={1}
        max={24}
        value={strokeWidth}
        onChange={(e) => setStrokeWidth(Number(e.target.value))}
        className="mt-2 w-9"
        title={`Stroke ${strokeWidth}px`}
        aria-label="Stroke width"
      />
      <span className="text-[9px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {strokeWidth}
      </span>

      {showFrames && (
        <div
          className="absolute left-[56px] top-20 z-20 max-h-72 w-44 overflow-auto rounded-[var(--radius-md)] border p-2"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <p className="sf-label mb-1.5 px-1">Frames · {role}</p>
          {frames.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                addFrame(f)
                setShowFrames(false)
                setTool('select')
              }}
              className="block w-full rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[11px] transition-colors"
              style={{ color: 'var(--text)' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              {f.label}
              <span className="ml-1.5 tabular-nums text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {f.width}×{f.height}
              </span>
            </button>
          ))}
        </div>
      )}

      <div
        className="mt-auto mb-1 h-1.5 w-1.5 rounded-full"
        style={{ background: roleColor }}
        title={role}
        aria-hidden
      />
      <div
        className="pb-1 text-center text-[8px] font-medium uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {role.slice(0, 3)}
      </div>
    </aside>
  )
}
