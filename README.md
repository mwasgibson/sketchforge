# SketchForge

Rough freehand sketch → polished editable mockup + **agent-ready Design Tree**. Multi-role design studio (developers, marketers, designers) with local IndexedDB persistence.

**https://github.com/mwasgibson/sketchforge**

## Features

- **Canvas** — pen, eraser, shapes, text, frames, pan/zoom, undo/redo
- **Roles** — Developer / Marketer / Designer / General
- **Generate** — heuristic polish (optional `VITE_GENERATE_URL` for AI)
- **Design Tree** — structured JSON for any agent/LLM
- **Export** — React+Tailwind, HTML/CSS, Vue, Svelte, tokens, brief, PNG, Agent JSON
- **Projects** — multi-project IndexedDB, auto-save, ⌘S

## Quick start

```bash
git clone https://github.com/mwasgibson/sketchforge.git
cd sketchforge
npm install
npm run dev
```

## Shortcuts

| Key | Action |
|-----|--------|
| V P E R O L T F H | Tools |
| ⌘Z / ⌘⇧Z | Undo / Redo |
| Delete | Delete selected |
| ⌘S | Save |
| Scroll | Zoom |

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · Konva · Zustand · idb

## Docs

See `docs/` for PRD, technical requirements, app flow, design brief, schema, and implementation plan.
