import { useRef, useEffect, useCallback, useState } from 'react'
import { Stage, Layer, Line, Rect, Ellipse, Text, Transformer } from 'react-konva'
import type Konva from 'konva'
import {
  useCanvasStore,
  createId,
  type LineShape,
  type RectShape,
  type EllipseShape,
  type TextShape,
  type FrameShape,
  type Shape,
} from '../store/useCanvasStore'

export function DrawingCanvas() {
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState({ width: 800, height: 600 })
  const [draft, setDraft] = useState<{
    type: 'line' | 'rect' | 'ellipse' | 'line-tool'
    points?: number[]
    x?: number
    y?: number
    width?: number
    height?: number
    radiusX?: number
    radiusY?: number
  } | null>(null)

  const tool = useCanvasStore((s) => s.tool)
  const strokeColor = useCanvasStore((s) => s.strokeColor)
  const strokeWidth = useCanvasStore((s) => s.strokeWidth)
  const fillColor = useCanvasStore((s) => s.fillColor)
  const shapes = useCanvasStore((s) => s.shapes)
  const selectedId = useCanvasStore((s) => s.selectedId)
  const scale = useCanvasStore((s) => s.scale)
  const stagePos = useCanvasStore((s) => s.stagePos)
  const setSelectedId = useCanvasStore((s) => s.setSelectedId)
  const setStagePos = useCanvasStore((s) => s.setStagePos)
  const setScale = useCanvasStore((s) => s.setScale)
  const addShape = useCanvasStore((s) => s.addShape)
  const updateShape = useCanvasStore((s) => s.updateShape)
  const pushHistory = useCanvasStore((s) => s.pushHistory)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight })
    })
    ro.observe(el)
    setSize({ width: el.clientWidth, height: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    const tr = trRef.current
    if (!stage || !tr) return
    if (selectedId && tool === 'select') {
      const node = stage.findOne('#' + selectedId)
      if (node) {
        tr.nodes([node])
        tr.getLayer()?.batchDraw()
      } else {
        tr.nodes([])
      }
    } else {
      tr.nodes([])
    }
  }, [selectedId, shapes, tool])

  const getPointer = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return null
    const pos = stage.getPointerPosition()
    if (!pos) return null
    return {
      x: (pos.x - stagePos.x) / scale,
      y: (pos.y - stagePos.y) / scale,
    }
  }, [scale, stagePos])

  const onPointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (tool === 'pan') return
    const stage = stageRef.current
    if (!stage) return

    if (tool === 'select') {
      if (e.target === stage) setSelectedId(null)
      return
    }

    const p = getPointer()
    if (!p) return

    if (tool === 'pen' || tool === 'eraser') {
      setDraft({ type: 'line', points: [p.x, p.y] })
    } else if (tool === 'rect' || tool === 'frame') {
      setDraft({ type: 'rect', x: p.x, y: p.y, width: 0, height: 0 })
    } else if (tool === 'ellipse') {
      setDraft({ type: 'ellipse', x: p.x, y: p.y, radiusX: 0, radiusY: 0 })
    } else if (tool === 'line') {
      setDraft({ type: 'line-tool', points: [p.x, p.y, p.x, p.y] })
    } else if (tool === 'text') {
      const text: TextShape = {
        id: createId(),
        type: 'text',
        x: p.x,
        y: p.y,
        text: 'Text',
        fontSize: 18,
        fontFamily: 'Inter, system-ui, sans-serif',
        stroke: strokeColor,
        strokeWidth: 0,
        fill: strokeColor,
      }
      addShape(text)
      setSelectedId(text.id)
      useCanvasStore.getState().setTool('select')
    }
  }

  const onPointerMove = () => {
    if (!draft) return
    const p = getPointer()
    if (!p) return

    if (draft.type === 'line' && draft.points) {
      setDraft({ ...draft, points: [...draft.points, p.x, p.y] })
    } else if (draft.type === 'rect' && draft.x != null && draft.y != null) {
      setDraft({ ...draft, width: p.x - draft.x, height: p.y - draft.y })
    } else if (draft.type === 'ellipse' && draft.x != null && draft.y != null) {
      setDraft({
        ...draft,
        radiusX: Math.abs(p.x - draft.x),
        radiusY: Math.abs(p.y - draft.y),
      })
    } else if (draft.type === 'line-tool' && draft.points) {
      setDraft({ ...draft, points: [draft.points[0], draft.points[1], p.x, p.y] })
    }
  }

  const onPointerUp = () => {
    if (!draft) return

    if (draft.type === 'line' && draft.points && draft.points.length >= 4) {
      const shape: LineShape = {
        id: createId(),
        type: 'line',
        x: 0,
        y: 0,
        points: draft.points,
        stroke: tool === 'eraser' ? '#000000' : strokeColor,
        strokeWidth: tool === 'eraser' ? Math.max(strokeWidth * 3, 12) : strokeWidth,
        tension: 0.3,
        lineCap: 'round',
        globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
      }
      addShape(shape)
    } else if (draft.type === 'rect' && draft.x != null && draft.y != null) {
      let { x, y, width = 0, height = 0 } = draft
      if (width < 0) {
        x += width
        width = Math.abs(width)
      }
      if (height < 0) {
        y += height
        height = Math.abs(height)
      }
      if (width > 2 || height > 2) {
        if (tool === 'frame') {
          const frame: FrameShape = {
            id: createId(),
            type: 'frame',
            x,
            y,
            width,
            height,
            stroke: '#3b82f6',
            strokeWidth: 2,
            fill: 'rgba(59,130,246,0.04)',
            label: 'Frame',
          }
          addShape(frame)
        } else {
          const shape: RectShape = {
            id: createId(),
            type: 'rect',
            x,
            y,
            width,
            height,
            stroke: strokeColor,
            strokeWidth,
            fill: fillColor === 'transparent' ? undefined : fillColor,
            cornerRadius: 0,
          }
          addShape(shape)
        }
      }
    } else if (draft.type === 'ellipse' && draft.x != null && draft.y != null) {
      const rx = draft.radiusX || 0
      const ry = draft.radiusY || 0
      if (rx > 1 || ry > 1) {
        const shape: EllipseShape = {
          id: createId(),
          type: 'ellipse',
          x: draft.x,
          y: draft.y,
          radiusX: rx,
          radiusY: ry,
          stroke: strokeColor,
          strokeWidth,
          fill: fillColor === 'transparent' ? undefined : fillColor,
        }
        addShape(shape)
      }
    } else if (draft.type === 'line-tool' && draft.points && draft.points.length === 4) {
      const shape: LineShape = {
        id: createId(),
        type: 'line',
        x: 0,
        y: 0,
        points: draft.points,
        stroke: strokeColor,
        strokeWidth,
        lineCap: 'round',
      }
      addShape(shape)
    }

    setDraft(null)
  }

  const onWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const oldScale = scale
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const scaleBy = 1.08
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clamped = Math.min(4, Math.max(0.2, newScale))
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    }
    setScale(clamped)
    setStagePos({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    })
  }

  useEffect(() => {
    ;(window as unknown as { __sketchforgeExportPng?: () => string | null }).__sketchforgeExportPng = () => {
      const stage = stageRef.current
      if (!stage) return null
      return stage.toDataURL({ pixelRatio: 2 })
    }
    ;(window as unknown as { __sketchforgeExportJson?: () => string }).__sketchforgeExportJson = () => {
      return JSON.stringify({ version: 1, shapes: useCanvasStore.getState().shapes }, null, 2)
    }
  }, [])

  const renderShape = (shape: Shape) => {
    const common = {
      id: shape.id,
      key: shape.id,
      draggable: tool === 'select',
      onClick: () => {
        if (tool === 'select') setSelectedId(shape.id)
      },
      onTap: () => {
        if (tool === 'select') setSelectedId(shape.id)
      },
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        pushHistory()
        updateShape(shape.id, { x: e.target.x(), y: e.target.y() })
      },
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        pushHistory()
        if (shape.type === 'rect' || shape.type === 'frame') {
          updateShape(shape.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, (shape as RectShape).width * scaleX),
            height: Math.max(5, (shape as RectShape).height * scaleY),
          })
        } else if (shape.type === 'ellipse') {
          updateShape(shape.id, {
            x: node.x(),
            y: node.y(),
            radiusX: Math.max(3, (shape as EllipseShape).radiusX * scaleX),
            radiusY: Math.max(3, (shape as EllipseShape).radiusY * scaleY),
          })
        } else {
          updateShape(shape.id, { x: node.x(), y: node.y() })
        }
      },
    }

    if (shape.type === 'line') {
      const s = shape as LineShape
      return (
        <Line
          {...common}
          points={s.points}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          tension={s.tension ?? 0}
          lineCap={(s.lineCap as 'round') || 'round'}
          globalCompositeOperation={(s.globalCompositeOperation as GlobalCompositeOperation) || 'source-over'}
        />
      )
    }
    if (shape.type === 'rect' || shape.type === 'frame') {
      const s = shape as RectShape
      return (
        <Rect
          {...common}
          x={s.x}
          y={s.y}
          width={s.width}
          height={s.height}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill={s.fill}
          cornerRadius={(s as { cornerRadius?: number }).cornerRadius || 0}
        />
      )
    }
    if (shape.type === 'ellipse') {
      const s = shape as EllipseShape
      return (
        <Ellipse
          {...common}
          x={s.x}
          y={s.y}
          radiusX={s.radiusX}
          radiusY={s.radiusY}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          fill={s.fill}
        />
      )
    }
    if (shape.type === 'text') {
      const s = shape as TextShape
      return (
        <Text
          {...common}
          x={s.x}
          y={s.y}
          text={s.text}
          fontSize={s.fontSize}
          fontFamily={s.fontFamily}
          fill={s.fill || s.stroke}
        />
      )
    }
    return null
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        <Layer>
          {shapes.map(renderShape)}
          {draft?.type === 'line' && draft.points && (
            <Line
              points={draft.points}
              stroke={tool === 'eraser' ? '#888' : strokeColor}
              strokeWidth={strokeWidth}
              tension={0.3}
              lineCap="round"
              opacity={0.7}
            />
          )}
          {draft?.type === 'rect' && draft.x != null && draft.y != null && (
            <Rect
              x={draft.x}
              y={draft.y}
              width={draft.width || 0}
              height={draft.height || 0}
              stroke={strokeColor}
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}
          {draft?.type === 'ellipse' && draft.x != null && draft.y != null && (
            <Ellipse
              x={draft.x}
              y={draft.y}
              radiusX={draft.radiusX || 0}
              radiusY={draft.radiusY || 0}
              stroke={strokeColor}
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}
          {draft?.type === 'line-tool' && draft.points && (
            <Line points={draft.points} stroke={strokeColor} strokeWidth={strokeWidth} lineCap="round" />
          )}
          <Transformer ref={trRef} rotateEnabled={false} boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox
            return newBox
          }} />
        </Layer>
      </Stage>
    </div>
  )
}
