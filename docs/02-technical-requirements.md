# 02 – Technical Requirements

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28

## 1. Architecture Overview

- **Frontend**: Single-page web application (React + TypeScript). Canvas-heavy UI with a drawing engine and a post-generation editing layer.
- **Backend**: Lightweight API for project persistence, optional auth, and generation orchestration. MVP is local-first (IndexedDB); optional remote generate endpoint only.
- **Generation pipeline**: Client-side heuristics + optional server-side LLM / vision model call that turns stroke data + role context into a structured Design Tree. The tree is the single source of truth for the editable mockup and agent/code exports.
- **Storage**: IndexedDB for multi-project persistence; localStorage for last-open; server DB only after auth is introduced.

## 2. Locked Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| UI framework | React 19 + TypeScript | Mature ecosystem, strong typing for design trees |
| Build | Vite | Fast DX |
| Styling | Tailwind CSS v4 + CSS variables | Rapid UI, design-token export |
| Canvas | Konva + react-konva | Freehand + polished node rendering in one engine |
| State | Zustand | Lightweight, works with canvas state |
| Persistence | IndexedDB via `idb` | Multi-project, offline-first |
| Auth | Anonymous-first | Lowest friction |
| AI / generation | Optional `VITE_GENERATE_URL`; heuristic fallback | Offline always works |

## 3. Non-Functional Requirements

- **Performance**: Canvas ≥ 60 fps while drawing. Generation of a typical mockup < 15 s (including any model round-trip).
- **Offline**: Core drawing and local polish heuristics work offline. Full AI generation and cloud save require network.
- **Accessibility**: Keyboard shortcuts, focus rings, ARIA labels, minimum 4.5:1 contrast.
- **Security**: No secrets in client; optional generate endpoint uses CORS, rate limiting, and input validation.
- **Privacy**: Anonymous projects stay local by default. Clear opt-in for any cloud processing.

## 4. Design Tree

Canonical JSON AST (`src/types/designTree.ts`): frames, groups, shapes, text, components, tokens, constraints, role + meta.intent. Consumed by code generators and agent payload.

## 5. Generate pipeline

1. Capture current shapes + optional PNG data URL.
2. Try optional remote endpoint (`VITE_GENERATE_URL`).
3. Fall back to local heuristic polish (snap, rect/ellipse inference, role frames).
4. Convert shapes → Design Tree.

## 6. Exports

- Developer: React+Tailwind, HTML/CSS, Vue, Svelte, structured JSON
- Marketer: PNG + campaign brief
- Designer: design tokens (JSON + CSS variables)
- All: agent payload JSON

## 7. Locked decisions

| Topic | Decision |
|-------|----------|
| Canvas library | Konva + react-konva |
| Generation input | Stroke JSON (primary) + optional PNG |
| Design Tree richness | Hierarchy + components + constraints + styles + tokens |
| Code targets | Multi-target; user selects at export |
| Auth timing | Anonymous-first |

## 8. Out of scope (MVP)

Server-side persistence, realtime collab, full constraint solver, payments, design-tool OAuth.
