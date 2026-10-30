# 06 – Implementation Plan

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28

## Phases completed

1. Canvas + tools (Konva, stores, history, keyboard shortcuts)
2. Design Tree types + shapeBridge + agent payload
3. Generate pipeline (heuristic + optional API)
4. Exports (multi-target code, tokens, brief)
5. Multi-project IndexedDB persistence + auto-save
6. Role UI (TopBar, rails, modals, empty state)
7. Design system pass (tokens, tool glyphs, chrome)

## Stack

React 19 + TypeScript + Vite + Tailwind v4 + Konva/react-konva + Zustand + idb

## Run

```bash
npm install
npm run dev
```

Optional AI generate:

```bash
# .env.local
VITE_GENERATE_URL=https://your-endpoint/generate
```

## Repo layout

```
src/
  components/   # Canvas, rails, modals, TopBar
  lib/          # generate, exports, shapeBridge, projectDb
  store/        # canvas, design, project, generate
  types/        # designTree AST
docs/           # PRD through implementation plan
```

## Success criteria (MVP)

- Sketch → polished editable mockup in under ~3 minutes
- Agent JSON sufficient for downstream LLM code gen
- Multi-role exports work offline

## Next (post-MVP)

- Auth + cloud sync
- Stronger AI polish / vision model
- Collaboration
- Expanded component library
- Mobile / responsive rails
