# 03 – App Flow

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28

## High-level user journey

1. Land on marketing / home page → “Start sketching” (no account required).
2. Enter workspace → choose role (or stay in General).
3. Optional: pick a starting frame / template (device, ad size, blank).
4. Draw rough idea with freehand + basic tools.
5. Hit “Generate polished mockup”.
6. System produces editable Design Tree → canvas switches to polished mode.
7. User edits the result (move, resize, restyle, regroup, add elements).
8. Export / hand-off:
   - Copy agent payload (JSON)
   - Download design package
   - “Generate code” (developer) or “Export assets + brief” (marketer) or “Export tokens” (designer)
9. Optional: save project (local or signed-in cloud).

## Detailed screens & steps

### 1. Landing / Marketing page
- Short value prop, 2–3 example before/after sketches, CTA “Start free – no account needed”.
- Secondary links: Pricing (placeholder), Docs, Sign in.

### 2. Workspace (main canvas)
**Layout**
- Left: Role switcher + tool palette (changes with role).
- Centre: Infinite or framed canvas.
- Right: Layers / properties panel (appears after generation or when selection exists).
- Top: Project name, Undo/Redo, Generate button, Export menu, Account / Save.

**Role selection**
- Developer → shows device frames (iPhone, Android, Desktop breakpoints), UI component stubs.
- Marketer → shows common ad / social sizes, brand colour swatches, headline placeholders.
- Designer → more free-form, style tokens visible, artboard sizes.
- General → minimal frames, pure drawing tools.

**Drawing phase tools (all roles)**
- Pen / freehand
- Eraser
- Rectangle, Ellipse, Line
- Text
- Select / Move
- Zoom, Pan, Undo, Redo
- Frame tool (role-filtered presets)

### 3. Generation
- User clicks “Generate polished mockup”.
- Optional short progress indicator (“Interpreting sketch…”, “Building layers…”).
- On success the canvas replaces the rough strokes with the polished Design Tree layers. Rough strokes can be kept as a ghost layer or discarded (user preference).

### 4. Editing phase
- Full selection, transform handles, property inspector (fill, stroke, typography, corner radius, opacity, constraints).
- Group / ungroup, bring forward / send backward.
- Add new elements from role-specific component library.
- Re-run generation on a selected region (optional stretch goal).

### 5. Export & hand-off
- **Agent payload**: Copy JSON or download `.sketchforge.json` (the Design Tree + metadata). Designed so any LLM/agent can ingest it.
- **Developer**: “Generate code” → modal or side panel. User selects target (React + Tailwind default, HTML/CSS, Vue, Svelte, Flutter, or structured description). Copy or download the result.
- **Marketer**: “Export assets” → ZIP of PNGs/SVGs at required sizes + a short Markdown brief derived from the design.
- **Designer**: “Export tokens” → CSS variables / Tailwind config / JSON tokens + style guide snapshot.
- Universal: Download editable project file, PNG/SVG snapshot of the current canvas.

### 6. Persistence
- Auto-save to IndexedDB while working.
- “Save to account” appears once user signs in (magic link or simple email/password).
- Project list (local + cloud) accessible from a simple sidebar or home after login.

### 7. Auth (lightweight)
- Sign-in modal (email magic link preferred for low friction).
- After sign-in, local projects can be migrated to the user’s account.

## Error & edge states
- Generation fails → clear message + “Try again” + option to keep the rough sketch.
- Empty canvas → Generate button disabled with tooltip.
- Network offline → generation disabled, local drawing still works.
- Large / complex sketches → soft warning about generation quality / time.

## Navigation summary
Landing → Workspace (role pick) → Draw → Generate → Edit → Export / Save  
Any point after first generation can return to drawing mode or start a new frame.
