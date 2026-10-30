import { useCanvasStore, type Shape } from '../store/useCanvasStore'
import { useDesignStore } from '../store/useDesignStore'
import { useProjectStore } from '../store/useProjectStore'
import { COMPONENT_STUBS } from '../types/designTree'
import { createId } from '../store/useCanvasStore'

function shapeLabel(s: Shape): string {
  switch (s.type) {
    case 'frame':
      return (s as { label?: string }).label || 'Frame'
    case 'text':
      return ((s as { text?: string }).text || 'Text').slice(0, 16)
    case 'line':
      return 'Path'
    case 'rect':
      return 'Rectangle'
    case 'ellipse':
      return 'Ellipse'
    default:
      return 'shape'
  }
}

export function RightRail() {
  const shapes = useCanvasStore((s) => s.shapes)
  const selectedId = useCanvasStore((s) => s.selectedId)
  const setSelectedId = useCanvasStore((s) => s.setSelectedId)
  const updateShape = useCanvasStore((s) => s.updateShape)
  const addShape = useCanvasStore((s) => s.addShape)
  const pushHistory = useCanvasStore((s) => s.pushHistory)
  const deleteSelected = useCanvasStore((s) => s.deleteSelected)

  const role = useProjectStore((s) => s.role)
  const mode = useDesignStore((s) => s.mode)
  const designTree = useDesignStore((s) => s.designTree)
  const promoteFromShapes = useDesignStore((s) => s.promoteFromShapes)
  const projectName = useProjectStore((s) => s.projectName)

  const selected = shapes.find((s) => s.id === selectedId) || null
  const stubs = COMPONENT_STUBS[role] || COMPONENT_STUBS.general

  const addComponent = (stub: (typeof stubs)[0]) => {
    pushHistory()
    if (stub.defaultText) {
      addShape({
        id: createId(),
        type: 'text',
        x: 120,
        y: 120,
        text: stub.defaultText,
        fontSize: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
        stroke: '#f0f0f0',
        strokeWidth: 0,
        fill: stub.type === 'Button' || stub.type === 'CTA' ? '#3b82f6' : '#f0f0f0',
        width: stub.defaultW,
      } as Shape)
    } else {
      addShape({
        id: createId(),
        type: 'rect',
        x: 120,
        y: 120,
        width: stub.defaultW,
        height: stub.defaultH,
        stroke: '#64748b',
        strokeWidth: 1,
        fill: 'rgba(59,130,246,0.15)',
        cornerRadius: 8,
      } as Shape)
    }
  }

  const onPromote = () => {
    promoteFromShapes(shapes, role, projectName)
  }

  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-l"
      style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}
    >
      <div className="border-b px-3 py-2" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Layers · {shapes.length}
        </p>
      </div>

      <div className="max-h-48 overflow-auto border-b px-1 py-1" style={{ borderColor: 'var(--border)' }}>
        {shapes.length === 0 && (
          <p className="px-2 py-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Draw on the canvas to create layers.
          </p>
        )}
        {[...shapes].reverse().map((s) => {
          const active = s.id === selectedId
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-[11px]"
              style={{
                background: active ? 'var(--bg-elevated)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-muted)',
              }}
            >
              <span className="truncate">{shapeLabel(s)}</span>
              <span className="ml-auto text-[9px] opacity-60">{s.type}</span>
            </button>
          )
        })}
      </div>

      <div className="border-b px-3 py-2" style={{ borderColor: 'var(--border)' }}>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Components ({role})
        </p>
        <div className="flex flex-wrap gap-1">
          {stubs.map((stub) => (
            <button
              key={stub.type}
              type="button"
              onClick={() => addComponent(stub)}
              className="rounded px-2 py-1 text-[10px] font-medium"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {stub.type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-3 py-2">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Properties
        </p>
        {selected ? (
          <div className="flex flex-col gap-2">
            <PropRow label="Type" value={selected.type} />
            {'x' in selected && (
              <PropNum
                label="X"
                value={(selected as { x: number }).x}
                onChange={(v) => updateShape(selected.id, { x: v })}
              />
            )}
            {'y' in selected && (
              <PropNum
                label="Y"
                value={(selected as { y: number }).y}
                onChange={(v) => updateShape(selected.id, { y: v })}
              />
            )}
            {'width' in selected && (
              <PropNum
                label="W"
                value={(selected as { width: number }).width}
                onChange={(v) => updateShape(selected.id, { width: v })}
              />
            )}
            {'height' in selected && (
              <PropNum
                label="H"
                value={(selected as { height: number }).height}
                onChange={(v) => updateShape(selected.id, { height: v })}
              />
            )}
            {selected.type === 'text' && (
              <div>
                <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Text</label>
                <input
                  className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  value={(selected as { text: string }).text}
                  onChange={(e) => updateShape(selected.id, { text: e.target.value })}
                />
              </div>
            )}
            <button
              type="button"
              onClick={deleteSelected}
              className="mt-2 rounded px-2 py-1 text-[11px]"
              style={{ color: '#ef4444', border: '1px solid var(--border)' }}
            >
              Delete
            </button>
          </div>
        ) : (
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Select a layer to edit properties.
          </p>
        )}
      </div>

      <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
        <p className="mb-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Design Tree · {mode}
        </p>
        <button
          type="button"
          onClick={onPromote}
          disabled={shapes.length === 0}
          className="w-full rounded px-2 py-1.5 text-[11px] font-medium disabled:opacity-40"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text)' }}
        >
          {designTree ? 'Refresh Design Tree' : 'Build Design Tree'}
        </button>
      </div>
    </aside>
  )
}

function PropRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function PropNum({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-4" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded border px-1.5 py-0.5"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
    </div>
  )
}
