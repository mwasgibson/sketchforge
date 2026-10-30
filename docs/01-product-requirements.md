# 01 – Product Requirements

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28  
**Status**: Decisions locked – awaiting final approval to begin implementation

## 1. Vision

SketchForge turns a rough freehand sketch into a polished, fully editable design mockup that also carries rich structured intent. The same output can be fed to any AI agent so the agent understands exactly what to build, or exported as code / production assets depending on the user’s role.

It serves developers, marketers, designers and other professionals from day one. Each role receives domain-specific tools, frames, component libraries and export formats.

## 2. Problem

Professionals who create visual or interactive work currently jump between sketching tools, design tools and production tools. Rough ideas stay rough, or require significant manual clean-up and reinterpretation before they can be handed to an engineer, an AI agent, or a production pipeline. Context and intent are lost in the hand-off.

## 3. Primary Use Cases

1. **Sketch → editable polished mockup** (core loop)  
   User draws roughly on a blank or role-specific canvas → system produces a clean, layered, editable design that the user can further refine.

2. **Agent-ready hand-off**  
   The polished mockup (plus its structured metadata) is exported in a format any downstream AI/agent can consume to generate code, assets, or further refinements without ambiguity.

3. **Role-specific production output**  
   - Developer: multi-target code generation (user chooses React+Tailwind, HTML/CSS, Vue, Svelte, Flutter, or plain structured description). Never locked to a single language.  
   - Marketer: export production-ready image assets + campaign brief / copy variants.  
   - Designer / general: export design tokens, style guide, and editable source.

4. **Multi-role workspace**  
   User selects a role (or works in a general mode). Tool palette, frames, and export options adapt accordingly.

## 4. Target Users

| Role | Description | Priority for MVP |
|------|-------------|------------------|
| Developer | Builds apps / websites. Needs device frames, UI kits, code export, agent-ready structure. | High |
| Marketer / Growth | Creates ads, landing pages, social creatives. Needs ad canvases, brand kits, asset + brief export. | High |
| Designer / Creative | Produces visual systems and mockups. Needs flexible canvas, tokens, style export. | High |
| Other professionals | Expandable later (product managers, educators, etc.). | Later |

## 5. MVP Scope (Must-haves)

- Freehand drawing canvas with basic tools (pen, eraser, shapes, text, select, zoom, undo/redo).
- Role selector (Developer / Marketer / Designer / General) that swaps toolsets, frames and default component libraries.
- Device / format frames (phone, tablet, desktop, social sizes, ad sizes, etc.) that appear based on role.
- “Generate polished mockup” action that converts the rough sketch into a clean, layered, editable design.
- Full post-generation editing of the polished result (move, resize, restyle, regroup, delete, add elements).
- Structured export / agent payload (JSON schema describing hierarchy, components, constraints, styles, role-specific metadata).
- Role-specific one-click outputs:
  - Developer → multi-target code generation (user selects target language/framework) or structured design description.
  - Marketer → asset pack + brief.
  - Designer → tokens + style guide.
- Local persistence of projects (browser storage + optional download).
- Simple account-less start; optional email/password or magic-link auth for saving across devices (can be lightweight).

## 6. Out of Scope for MVP (Later)

- Real-time multi-user collaboration.
- Native mobile / desktop apps.
- Full Figma-level component variants and auto-layout engine.
- Direct deployment of generated code.
- Advanced AI chat inside the canvas beyond the core generate + agent export.
- Version history beyond basic undo.
- Marketplace of community components or templates.

## 7. Success Metrics (MVP)

- A first-time user can go from blank canvas to a polished, editable mockup in under 3 minutes.
- Generated mockup is judged “usable as a starting point” by ≥ 80 % of test users in the target roles.
- Structured agent payload is sufficient for a downstream LLM to produce a recognisable implementation without additional clarification.
- Users from at least two different roles complete a full sketch → polish → export flow.

## 8. Open Questions

- Preferred product name (SketchForge is provisional).

## 9. Decisions Log

| Decision | Reason |
|----------|--------|
| Multi-role from day one | Explicit user request; avoids early siloing. |
| Web-only for v1 | Explicit user request; fastest path to usable product. |
| Polished mockup + structured intent as primary output | Matches “editable + agent-understandable + code-on-demand”. |
| No hard tech constraints | User stated none; choose pragmatic modern stack. |
| Multi-target code export | Developers must be able to choose language/framework; never lock to a single target. |
| Anonymous-first auth | Low friction; cloud save optional after sign-in. |
| Design Tree richness (day one) | Rich enough for reliable LLM consumption (hierarchy, components, constraints, styles, role metadata) but not a full constraint solver. |
| Canvas engine | Konva + react-konva (full control over freehand capture and polished node rendering). |
