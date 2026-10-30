# 05 – Backend Schema & API

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28

## Overview

MVP is **local-first**. Persistence is IndexedDB in the browser. Optional remote generate endpoint only — no required backend for the core loop.

## Design Tree (core schema)

Canonical TypeScript AST in `src/types/designTree.ts`:

- Root frame with children (groups, shapes, components, text)
- Tokens: colors, fonts, radii, spacing
- Constraints / layout hints
- Role + `meta.intent` for agent consumption
- Component stubs: Button, Input, Card, Headline, CTA (`COMPONENT_STUBS`)

## Local persistence (IndexedDB)

- **Database**: `sketchforge`
- **Store**: `projects`
  - `id`, `name`, `role`, `theme`, `shapes`, `designTree`, `updatedAt`, optional thumbnail

**APIs** (`src/lib/projectDb.ts`):

- `listProjects`
- `getProject`
- `saveProject`
- `deleteProject`
- `duplicateProject`

**App layer** (`useProjectStore`): hydrate last project, auto-save, save status.

## Optional generate API

```
POST VITE_GENERATE_URL
Body: { role, title, shapes, pngDataUrl }
Response: { shapes, designTree, message? }
```

Fallback: heuristic polish always available offline (`src/lib/generate.ts`).

## Agent payload

JSON export of Design Tree + flattened nodes + role metadata — any downstream LLM can consume without extra clarification.

## Future (post-MVP)

- Auth + cloud project sync
- Job queue for long-running generation
- Collaborative sessions
