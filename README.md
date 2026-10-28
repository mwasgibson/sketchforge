# SketchForge

Rough sketch → polished editable mockup + agent-ready Design Tree. Multi-role exports. Full local project persistence.

## Status

Phases 0–4 + **full project persistence** complete.

## Persistence

- **IndexedDB** stores complete projects (shapes, Design Tree, role, title)
- **Auto-save** debounced (~800ms) after edits
- **Projects** panel: new, open, duplicate, delete
- Restores last project on reload
- **⌘S** forces an immediate save
- Theme still in localStorage; project data in IndexedDB

## Features

- Drawing: pen, shapes, frames, components, undo/redo
- **Generate** — heuristic polish (optional `VITE_GENERATE_URL`)
- Design Tree + **Agent** JSON
- **Export…** — code (React/HTML/Vue/Svelte), brief, tokens, PNG
- Multi-project workspace

## Run

```bash
npm install
npm run dev
```

## Shortcuts

V P E R O L T F H · ⌘Z / ⌘⇧Z · Delete · ⌘S save · Scroll zoom

## Docs

See `docs/` for product requirements, technical design, and implementation plan.
