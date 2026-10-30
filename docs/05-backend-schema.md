# 05 – Backend Schema & API

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28

## Overview

MVP is local-first. Persistence is IndexedDB in the browser. Optional remote generate endpoint only.

## Design Tree (core schema)

See `src/types/designTree.ts` for the TypeScript AST. Summary:

- Root frame with children (groups, shapes, components, text)
- Tokens: colors, fonts, radii, spacing
- Constraints / layout hints
- Role + meta.intent for agent consumption
- Component stubs: Button, Input, Card, Headline, CTA

## Local persistence (IndexedDB)

Database: `sketchforge`
Stores:
- `projects` — id, name, role, theme, shapes, designTree, updatedAt, thumbnail?

APIs in `src/lib/projectDb.ts`:
- listProjects, getProject, saveProject, deleteProject, duplicateProject

## Optional generate API

`POST VITE_GENERATE_URL`
Body: `{ role, title, shapes, pngDataUrl }`
Response: `{ shapes, designTree, message? }`

Fallback: heuristic polish always available offline.

## Agent payload

JSON export of Design Tree + flattened nodes + role metadata — any LLM can consume.
