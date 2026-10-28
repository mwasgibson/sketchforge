import { useEffect, useRef } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { useCanvasStore } from '../store/useCanvasStore'
import { useDesignStore } from '../store/useDesignStore'

const DEBOUNCE_MS = 800

/**
 * Watches canvas + project metadata and debounces IndexedDB saves.
 */
export function AutoSave() {
  const hydrated = useProjectStore((s) => s.hydrated)
  const projectId = useProjectStore((s) => s.projectId)
  const projectName = useProjectStore((s) => s.projectName)
  const role = useProjectStore((s) => s.role)
  const shapes = useCanvasStore((s) => s.shapes)
  const designTree = useDesignStore((s) => s.designTree)
  const saveCurrent = useProjectStore((s) => s.saveCurrent)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipFirst = useRef(true)

  useEffect(() => {
    if (!hydrated || !projectId) return
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      void saveCurrent({
        title: projectName,
        role,
        shapes,
        designTree,
        thumbnail: null,
      })
    }, DEBOUNCE_MS)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [hydrated, projectId, projectName, role, shapes, designTree, saveCurrent])

  useEffect(() => {
    skipFirst.current = true
  }, [projectId])

  return null
}
