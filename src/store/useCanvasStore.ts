import { create } from 'zustand'

export type Tool =
  | 'select'
  | 'pen'
  | 'eraser'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'pan'
  | 'frame'

export type ShapeType = 'line' | 'rect' | 'ellipse' | 'text' | 'frame'

export interface BaseShape {
  id: string
  type: ShapeType
  x: number
  y: number
  stroke: string
  strokeWidth: number
  fill?: string
  opacity?: number
  rotation?: number
}

export interface LineShape extends BaseShape {
  type: 'line'
  points: number[]
  tension?: number
  lineCap?: 'round' | 'butt' | 'square'
  globalCompositeOperation?: string
}

export interface RectShape extends BaseShape {
  type: 'rect'
  width: number
  height: number
  cornerRadius?: number
}

export interface EllipseShape extends BaseShape {
  type: 'ellipse'
  radiusX: number
  radiusY: number
}

export interface TextShape extends BaseShape {
  type: 'text'
  text: string
  fontSize: number
  fontFamily?: string
  width?: number
}

export interface FrameShape extends BaseShape {
  type: 'frame'
  width: number
  height: number
  label: string
  name?: string
}

export type Shape = LineShape | RectShape | EllipseShape | TextShape | FrameShape

export interface FramePreset {
  id: string
  label: string
  width: number
  height: number
  roles: Array<'developer' | 'marketer' | 'designer' | 'general'>
}

export const FRAME_PRESETS: FramePreset[] = [
  { id: 'iphone-15', label: 'iPhone 15', width: 393, height: 852, roles: ['developer', 'general'] },
  { id: 'android', label: 'Android', width: 360, height: 800, roles: ['developer', 'general'] },
  { id: 'desktop', label: 'Desktop 1280', width: 1280, height: 800, roles: ['developer', 'general'] },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024, roles: ['developer', 'general'] },
  { id: 'ig-square', label: 'IG Square', width: 1080, height: 1080, roles: ['marketer', 'general'] },
  { id: 'ig-story', label: 'IG Story', width: 1080, height: 1920, roles: ['marketer', 'general'] },
  { id: 'fb-ad', label: 'FB Ad', width: 1200, height: 628, roles: ['marketer', 'general'] },
  { id: 'linkedin', label: 'LinkedIn', width: 1200, height: 627, roles: ['marketer', 'general'] },
  { id: 'a4', label: 'A4', width: 794, height: 1123, roles: ['designer', 'general'] },
  { id: 'artboard-hd', label: 'Artboard HD', width: 1920, height: 1080, roles: ['designer', 'general'] },
  { id: 'square-1k', label: '1K Square', width: 1000, height: 1000, roles: ['designer', 'general'] },
]

interface CanvasState {
  tool: Tool
  strokeColor: string
  strokeWidth: number
  fillColor: string
  shapes: Shape[]
  selectedId: string | null
  past: Shape[][]
  future: Shape[][]
  scale: number
  stagePos: { x: number; y: number }
  isDrawing: boolean

  setTool: (tool: Tool) => void
  setStrokeColor: (c: string) => void
  setStrokeWidth: (w: number) => void
  setFillColor: (c: string) => void
  setSelectedId: (id: string | null) => void
  setScale: (s: number) => void
  setStagePos: (p: { x: number; y: number }) => void
  setIsDrawing: (v: boolean) => void

  addShape: (shape: Shape) => void
  updateShape: (id: string, patch: Partial<Shape>) => void
  deleteSelected: () => void
  clearCanvas: () => void

  pushHistory: () => void
  undo: () => void
  redo: () => void

  addFrame: (preset: FramePreset, x?: number, y?: number) => void
  getShapesSnapshot: () => Shape[]
  loadShapes: (shapes: Shape[]) => void
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  tool: 'pen',
  strokeColor: '#f0f0f0',
  strokeWidth: 3,
  fillColor: 'transparent',
  shapes: [],
  selectedId: null,
  past: [],
  future: [],
  scale: 1,
  stagePos: { x: 0, y: 0 },
  isDrawing: false,

  setTool: (tool) => set({ tool, selectedId: tool === 'select' ? get().selectedId : null }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setFillColor: (fillColor) => set({ fillColor }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setScale: (scale) => set({ scale }),
  setStagePos: (stagePos) => set({ stagePos }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),

  pushHistory: () => {
    const { shapes, past } = get()
    set({ past: [...past.slice(-49), shapes], future: [] })
  },

  addShape: (shape) => {
    get().pushHistory()
    set({ shapes: [...get().shapes, shape] })
  },

  updateShape: (id, patch) => {
    set({
      shapes: get().shapes.map((s) => (s.id === id ? ({ ...s, ...patch } as Shape) : s)),
    })
  },

  deleteSelected: () => {
    const { selectedId, shapes } = get()
    if (!selectedId) return
    get().pushHistory()
    set({ shapes: shapes.filter((s) => s.id !== selectedId), selectedId: null })
  },

  clearCanvas: () => {
    if (get().shapes.length === 0) return
    get().pushHistory()
    set({ shapes: [], selectedId: null })
  },

  undo: () => {
    const { past, shapes, future } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      future: [shapes, ...future],
      shapes: previous,
      selectedId: null,
    })
  },

  redo: () => {
    const { past, shapes, future } = get()
    if (future.length === 0) return
    const next = future[0]
    set({
      future: future.slice(1),
      past: [...past, shapes],
      shapes: next,
      selectedId: null,
    })
  },

  addFrame: (preset, x = 80, y = 80) => {
    get().pushHistory()
    const frame: FrameShape = {
      id: uid(),
      type: 'frame',
      x,
      y,
      width: preset.width,
      height: preset.height,
      stroke: '#3b82f6',
      strokeWidth: 2,
      fill: 'rgba(59,130,246,0.04)',
      label: preset.label,
      name: preset.id,
    }
    set({ shapes: [...get().shapes, frame], selectedId: frame.id, tool: 'select' })
  },

  getShapesSnapshot: () => get().shapes,
  loadShapes: (shapes) => set({ shapes, selectedId: null, past: [], future: [] }),
}))

export function createId() {
  return uid()
}
