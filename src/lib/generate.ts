/**
 * SketchForge generation pipeline
 * - Captures sketch (PNG data URL + stroke JSON)
 * - Heuristic polish path (always available, offline)
 * - Optional remote LLM/vision endpoint when VITE_GENERATE_URL is set
 */

import type { Shape, LineShape, RectShape, EllipseShape, TextShape, FrameShape } from '../store/useCanvasStore'
import type { DesignTree, Role } from '../types/designTree'
import { shapesToDesignTree } from './shapeBridge'

export interface SketchCapture {
  pngDataUrl: string | null
  shapes: Shape[]
  role: Role
  title: string
}

export interface GenerateResult {
  shapes: Shape[]
  designTree: DesignTree
  source: 'heuristic' | 'api'
  message?: string
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function snap(n: number, grid = 8) {
  return Math.round(n / grid) * grid
}

/** Infer cleaned shapes from freehand strokes */
export function heuristicPolish(shapes: Shape[], role: Role): Shape[] {
  const out: Shape[] = []
  for (const s of shapes) {
    if (s.type === 'line' && (s as LineShape).points.length >= 4) {
      const pts = (s as LineShape).points
      // bounding box of stroke
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      for (let i = 0; i < pts.length; i += 2) {
        minX = Math.min(minX, pts[i])
        maxX = Math.max(maxX, pts[i])
        minY = Math.min(minY, pts[i + 1])
        maxY = Math.max(maxY, pts[i + 1])
      }
      const w = maxX - minX
      const h = maxY - minY
      const aspect = w / (h || 1)
      // roughly rectangular stroke → rect
      if (w > 24 && h > 16 && aspect > 0.4 && aspect < 3.5) {
        out.push({
          id: uid(),
          type: 'rect',
          x: snap(minX),
          y: snap(minY),
          width: snap(w),
          height: snap(h),
          stroke: s.stroke || '#1e293b',
          strokeWidth: 2,
          fill: 'transparent',
        } satisfies RectShape)
        continue
      }
      // roughly circular → ellipse
      if (w > 20 && h > 20 && Math.abs(aspect - 1) < 0.35) {
        out.push({
          id: uid(),
          type: 'ellipse',
          x: snap(minX + w / 2),
          y: snap(minY + h / 2),
          radiusX: snap(w / 2),
          radiusY: snap(h / 2),
          stroke: s.stroke || '#1e293b',
          strokeWidth: 2,
          fill: 'transparent',
        } satisfies EllipseShape)
        continue
      }
    }
    // keep other shapes, snap positions
    if (s.type === 'rect' || s.type === 'frame') {
      const r = s as RectShape
      out.push({ ...r, x: snap(r.x), y: snap(r.y), width: snap(r.width), height: snap(r.height) })
    } else if (s.type === 'ellipse') {
      const e = s as EllipseShape
      out.push({ ...e, x: snap(e.x), y: snap(e.y), radiusX: snap(e.radiusX), radiusY: snap(e.radiusY) })
    } else if (s.type === 'text') {
      const t = s as TextShape
      out.push({ ...t, x: snap(t.x), y: snap(t.y) })
    } else {
      out.push(s)
    }
  }

  // ensure at least one frame for role
  const hasFrame = out.some((s) => s.type === 'frame')
  if (!hasFrame && out.length > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const s of out) {
      if ('x' in s && 'y' in s) {
        const w = 'width' in s ? (s as RectShape).width : 'radiusX' in s ? (s as EllipseShape).radiusX * 2 : 40
        const h = 'height' in s ? (s as RectShape).height : 'radiusY' in s ? (s as EllipseShape).radiusY * 2 : 20
        minX = Math.min(minX, s.x)
        minY = Math.min(minY, s.y)
        maxX = Math.max(maxX, s.x + w)
        maxY = Math.max(maxY, s.y + h)
      }
    }
    const pad = 24
    const fw = role === 'developer' ? Math.max(393, maxX - minX + pad * 2) : Math.max(320, maxX - minX + pad * 2)
    const fh = role === 'developer' ? Math.max(200, maxY - minY + pad * 2) : Math.max(200, maxY - minY + pad * 2)
    out.unshift({
      id: uid(),
      type: 'frame',
      x: snap(minX - pad),
      y: snap(minY - pad),
      width: snap(fw),
      height: snap(fh),
      stroke: '#3b82f6',
      strokeWidth: 2,
      fill: 'rgba(59,130,246,0.04)',
      label: role === 'developer' ? 'Screen' : 'Canvas',
    } satisfies FrameShape)
  }

  return out
}

/** Call optional remote generate API. Returns null if not configured or fails. */
async function callRemoteGenerate(capture: SketchCapture): Promise<GenerateResult | null> {
  const url = import.meta.env.VITE_GENERATE_URL as string | undefined
  if (!url) return null

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: capture.role,
        title: capture.title,
        shapes: capture.shapes,
        pngDataUrl: capture.pngDataUrl,
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { shapes?: Shape[]; designTree?: DesignTree; message?: string }
    if (!data.shapes || !data.designTree) return null
    return {
      shapes: data.shapes,
      designTree: data.designTree,
      source: 'api',
      message: data.message,
    }
  } catch {
    return null
  }
}

/**
 * Main generate entry: try API, fall back to heuristic polish.
 */
export async function generatePolished(capture: SketchCapture): Promise<GenerateResult> {
  // Artificial minimum delay so the progress UI is visible
  const delay = new Promise((r) => setTimeout(r, 600))

  const remote = await Promise.all([callRemoteGenerate(capture), delay]).then(([r]) => r)
  if (remote) return remote

  const polished = heuristicPolish(capture.shapes, capture.role)
  const designTree = shapesToDesignTree(polished, capture.role, capture.title)
  designTree.meta.intent = `Polished ${capture.role} mockup from rough sketch`

  return {
    shapes: polished,
    designTree,
    source: 'heuristic',
    message: 'Polished with local heuristics (set VITE_GENERATE_URL for AI generation).',
  }
}
