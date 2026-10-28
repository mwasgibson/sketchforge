# 02 – Technical Requirements

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28

## Stack (locked)

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Canvas | Konva + react-konva |
| State | Zustand (with persist where useful) |
| Persistence | IndexedDB via `idb` (multi-project) + localStorage for last-open |
| Auth | Anonymous-first; optional later |

## Design Tree

Canonical AST for polished designs. JSON-serializable. Consumed by code generators and agent payload.

## Generate pipeline

1. Capture current shapes + optional PNG data URL.
2. Try optional remote endpoint (`VITE_GENERATE_URL`).
3. Fall back to local heuristic polish (snap, rect/ellipse inference, role frames).
4. Convert shapes → Design Tree.

## Exports

- Developer: React+Tailwind, HTML/CSS, Vue, Svelte, structured JSON
- Marketer: PNG + campaign brief
- Designer: design tokens (JSON + CSS variables)
- All: agent payload JSON

## Non-goals for MVP

Server-side persistence, realtime collab, full constraint solver.
