import type { Shape, LineShape, RectShape, EllipseShape, TextShape, FrameShape } from '../store/useCanvasStore'
import type {
  DesignNode,
  FrameNode,
  RectNode,
  EllipseNode,
  LineNode,
  TextNode,
  ComponentNode,
  DesignTree,
  Role,
} from '../types/designTree'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

/** Convert canvas Shape[] into a DesignTree (polished representation) */
export function shapesToDesignTree(
  shapes: Shape[],
  role: Role,
  title: string
): DesignTree {
  const children: DesignNode[] = shapes.map(shapeToNode)
  const now = new Date().toISOString()

  const frame = children.find((c) => c.type === 'frame') as FrameNode | undefined
  const others = children.filter((c) => c.type !== 'frame')

  let root: DesignNode
  if (frame) {
    root = {
      ...frame,
      children: [...(frame.children || []), ...others],
    }
  } else {
    root = {
      id: uid(),
      type: 'frame',
      name: 'Artboard',
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      label: 'Artboard',
      style: { fill: 'transparent', stroke: '#3b82f6', strokeWidth: 1 },
      children: others,
    }
  }

  return {
    id: uid(),
    version: 1,
    role,
    meta: {
      title,
      createdAt: now,
      updatedAt: now,
    },
    root,
    tokens: {
      colors: {
        accent: '#3b82f6',
        text: '#f0f0f0',
        background: '#0f0f0f',
      },
      fonts: {
        body: 'Inter, system-ui, sans-serif',
      },
      radii: { sm: 4, md: 8, lg: 12 },
    },
  }
}

function shapeToNode(s: Shape): DesignNode {
  switch (s.type) {
    case 'frame': {
      const f = s as FrameShape
      return {
        id: f.id,
        type: 'frame',
        name: f.label || f.name || 'Frame',
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        label: f.label,
        style: {
          stroke: f.stroke,
          strokeWidth: f.strokeWidth,
          fill: f.fill,
          opacity: f.opacity,
        },
        rotation: f.rotation,
        children: [],
      } satisfies FrameNode
    }
    case 'rect': {
      const r = s as RectShape
      return {
        id: r.id,
        type: 'rect',
        name: 'Rectangle',
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        style: {
          stroke: r.stroke,
          strokeWidth: r.strokeWidth,
          fill: r.fill,
          cornerRadius: r.cornerRadius,
          opacity: r.opacity,
        },
        rotation: r.rotation,
      } satisfies RectNode
    }
    case 'ellipse': {
      const e = s as EllipseShape
      return {
        id: e.id,
        type: 'ellipse',
        name: 'Ellipse',
        x: e.x,
        y: e.y,
        width: e.radiusX * 2,
        height: e.radiusY * 2,
        radiusX: e.radiusX,
        radiusY: e.radiusY,
        style: {
          stroke: e.stroke,
          strokeWidth: e.strokeWidth,
          fill: e.fill,
          opacity: e.opacity,
        },
        rotation: e.rotation,
      } satisfies EllipseNode
    }
    case 'line': {
      const l = s as LineShape
      return {
        id: l.id,
        type: 'line',
        name: 'Line',
        x: l.x,
        y: l.y,
        points: l.points,
        style: {
          stroke: l.stroke,
          strokeWidth: l.strokeWidth,
          opacity: l.opacity,
        },
      } satisfies LineNode
    }
    case 'text': {
      const t = s as TextShape
      return {
        id: t.id,
        type: 'text',
        name: 'Text',
        x: t.x,
        y: t.y,
        text: t.text,
        width: t.width,
        style: {
          fill: t.fill || t.stroke,
          fontSize: t.fontSize,
          fontFamily: t.fontFamily,
          opacity: t.opacity,
        },
        rotation: t.rotation,
      } satisfies TextNode
    }
    default:
      return {
        id: (s as Shape).id,
        type: 'rect',
        name: 'Unknown',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      }
  }
}

export function createComponentNode(
  componentType: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  text?: string
): ComponentNode {
  return {
    id: uid(),
    type: 'component',
    name: label,
    componentType,
    x,
    y,
    width: w,
    height: h,
    text: text,
    style: {
      fill: componentType === 'Button' || componentType === 'CTA' ? '#3b82f6' : 'transparent',
      stroke: '#64748b',
      strokeWidth: 1,
      cornerRadius: 8,
      fontSize: 14,
      fontFamily: 'Inter, system-ui, sans-serif',
      textAlign: 'center',
    },
    props: {},
  }
}

export function flattenNodes(node: DesignNode, depth = 0): { node: DesignNode; depth: number }[] {
  const result: { node: DesignNode; depth: number }[] = [{ node, depth }]
  if (node.children) {
    for (const child of node.children) {
      result.push(...flattenNodes(child, depth + 1))
    }
  }
  return result
}

export function findNode(root: DesignNode, id: string): DesignNode | null {
  if (root.id === id) return root
  if (root.children) {
    for (const c of root.children) {
      const found = findNode(c, id)
      if (found) return found
    }
  }
  return null
}

export function updateNodeInTree(
  root: DesignNode,
  id: string,
  patch: Partial<DesignNode>
): DesignNode {
  if (root.id === id) {
    return { ...root, ...patch } as DesignNode
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((c) => updateNodeInTree(c, id, patch)),
    } as DesignNode
  }
  return root
}

export function toAgentPayload(tree: DesignTree, intent?: string) {
  return {
    format: 'sketchforge-design-tree' as const,
    version: '1.0',
    role: tree.role,
    intent: intent || tree.meta.intent,
    tree,
    tokens: tree.tokens,
    suggestedCodeTargets: ['react-tailwind', 'html-css', 'vue', 'svelte', 'flutter', 'structured'],
  }
}
