import { create } from 'zustand'
import type { DesignTree, DesignNode, Role } from '../types/designTree'
import { shapesToDesignTree, toAgentPayload, updateNodeInTree } from '../lib/shapeBridge'
import type { Shape } from './useCanvasStore'

interface DesignState {
  mode: 'sketch' | 'polished'
  designTree: DesignTree | null
  selectedNodeId: string | null

  setMode: (mode: 'sketch' | 'polished') => void
  setSelectedNodeId: (id: string | null) => void
  promoteFromShapes: (shapes: Shape[], role: Role, title: string) => void
  updateSelectedNode: (patch: Partial<DesignNode>) => void
  getAgentPayloadJson: (intent?: string) => string | null
  clearDesignTree: () => void
}

export const useDesignStore = create<DesignState>((set, get) => ({
  mode: 'sketch',
  designTree: null,
  selectedNodeId: null,

  setMode: (mode) => set({ mode }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

  promoteFromShapes: (shapes, role, title) => {
    const tree = shapesToDesignTree(shapes, role, title)
    set({ designTree: tree, mode: 'polished', selectedNodeId: tree.root.id })
  },

  updateSelectedNode: (patch) => {
    const { designTree, selectedNodeId } = get()
    if (!designTree || !selectedNodeId) return
    const newRoot = updateNodeInTree(designTree.root, selectedNodeId, patch)
    set({
      designTree: {
        ...designTree,
        root: newRoot,
        meta: { ...designTree.meta, updatedAt: new Date().toISOString() },
        version: designTree.version + 1,
      },
    })
  },

  getAgentPayloadJson: (intent) => {
    const { designTree } = get()
    if (!designTree) return null
    return JSON.stringify(toAgentPayload(designTree, intent), null, 2)
  },

  clearDesignTree: () => set({ designTree: null, mode: 'sketch', selectedNodeId: null }),
}))
