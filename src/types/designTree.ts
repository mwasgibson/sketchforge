/** SketchForge Design Tree — single source of truth for polished mockups & agent export */

export type Role = 'developer' | 'marketer' | 'designer' | 'general'

export interface DesignTokens {
  colors?: Record<string, string>
  fonts?: Record<string, string>
  spacing?: Record<string, number>
  radii?: Record<string, number>
}

export interface LayoutConstraints {
  left?: number | 'auto'
  right?: number | 'auto'
  top?: number | 'auto'
  bottom?: number | 'auto'
  width?: number | 'fill' | 'hug'
  height?: number | 'fill' | 'hug'
}

export interface NodeStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  cornerRadius?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: number | string
  textAlign?: 'left' | 'center' | 'right'
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export type DesignNodeType =
  | 'frame'
  | 'group'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'image'
  | 'component'

export interface BaseDesignNode {
  id: string
  type: DesignNodeType
  name?: string
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  opacity?: number
  visible?: boolean
  locked?: boolean
  constraints?: LayoutConstraints
  style?: NodeStyle
  children?: DesignNode[]
}

export interface FrameNode extends BaseDesignNode {
  type: 'frame'
  width: number
  height: number
  label?: string
  clipContent?: boolean
}

export interface GroupNode extends BaseDesignNode {
  type: 'group'
  children: DesignNode[]
}

export interface RectNode extends BaseDesignNode {
  type: 'rect'
  width: number
  height: number
}

export interface EllipseNode extends BaseDesignNode {
  type: 'ellipse'
  width: number
  height: number
  radiusX?: number
  radiusY?: number
}

export interface LineNode extends BaseDesignNode {
  type: 'line'
  points: number[]
}

export interface TextNode extends BaseDesignNode {
  type: 'text'
  text: string
  width?: number
}

export interface ImageNode extends BaseDesignNode {
  type: 'image'
  width: number
  height: number
  src?: string
}

export interface ComponentNode extends BaseDesignNode {
  type: 'component'
  componentType: string
  width: number
  height: number
  props?: Record<string, unknown>
  text?: string
}

export type DesignNode =
  | FrameNode
  | GroupNode
  | RectNode
  | EllipseNode
  | LineNode
  | TextNode
  | ImageNode
  | ComponentNode

export interface DesignTree {
  id: string
  version: number
  role: Role
  meta: {
    title: string
    createdAt: string
    updatedAt: string
    frame?: string
    intent?: string
  }
  root: DesignNode
  tokens?: DesignTokens
}

export interface AgentPayload {
  format: 'sketchforge-design-tree'
  version: string
  role: Role
  intent?: string
  tree: DesignTree
  tokens?: DesignTokens
  suggestedCodeTargets: string[]
}

export const COMPONENT_STUBS: Record<
  Role,
  { type: string; label: string; defaultW: number; defaultH: number; defaultText?: string }[]
> = {
  developer: [
    { type: 'Button', label: 'Button', defaultW: 120, defaultH: 40, defaultText: 'Button' },
    { type: 'Input', label: 'Input', defaultW: 240, defaultH: 40, defaultText: 'Placeholder' },
    { type: 'Card', label: 'Card', defaultW: 280, defaultH: 160 },
    { type: 'NavBar', label: 'Nav Bar', defaultW: 393, defaultH: 56, defaultText: 'App' },
    { type: 'TabBar', label: 'Tab Bar', defaultW: 393, defaultH: 64 },
  ],
  marketer: [
    { type: 'Headline', label: 'Headline', defaultW: 400, defaultH: 48, defaultText: 'Your headline' },
    { type: 'CTA', label: 'CTA Button', defaultW: 160, defaultH: 48, defaultText: 'Get started' },
    { type: 'AdUnit', label: 'Ad Unit', defaultW: 300, defaultH: 250 },
    { type: 'Logo', label: 'Logo', defaultW: 120, defaultH: 40 },
  ],
  designer: [
    { type: 'Heading', label: 'Heading', defaultW: 320, defaultH: 40, defaultText: 'Heading' },
    { type: 'Body', label: 'Body text', defaultW: 320, defaultH: 80, defaultText: 'Body copy' },
    { type: 'ImagePlace', label: 'Image', defaultW: 320, defaultH: 200 },
    { type: 'Divider', label: 'Divider', defaultW: 320, defaultH: 2 },
  ],
  general: [
    { type: 'Box', label: 'Box', defaultW: 120, defaultH: 80 },
    { type: 'Label', label: 'Label', defaultW: 100, defaultH: 24, defaultText: 'Label' },
  ],
}
