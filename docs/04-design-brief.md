# 04 – Design Brief

**Product**: SketchForge  
**Version**: MVP / v1  
**Date**: 2026-10-28

## 1. Design Goals

- Feel like a professional creative tool, not a toy.
- Canvas is the hero; chrome stays quiet and role-aware.
- Fast, confident interactions — drawing should feel immediate.
- Polished output should look intentionally designed, not “AI-slop”.
- Clear visual distinction between “rough sketch mode” and “editable polished mode”.

## 2. Mood & Personality

- Calm, precise, modern.
- Slightly industrial / Swiss-influenced for developers; warmer and more expressive accents for marketers; clean and typographic for designers.
- Overall tone: competent, trustworthy, creative.

## 3. Colour System

- **Base**: Neutral dark or light theme (user preference, system default).
- **Accent**: Single strong accent (electric blue) for primary actions.
- **Role accents** (subtle): Developer cool blue, Marketer warm coral, Designer violet.
- Semantic colours for success / warning / error.
- All colours exposed as CSS variables / design tokens.

## 4. Typography

- UI: Inter or system UI font stack.
- Canvas text: user-selectable with good defaults.

## 5. Layout Principles

- Three-zone workspace: left tools, centre canvas, right layers/properties.
- Top bar thin and persistent.
- Responsive: side rails become drawers on narrow screens.

## 6. Key UI Components

- Role switcher, tool palette, frame library, Generate button, properties panel, layer list, export menu.

## 7. Interaction Notes

- Drawing feels immediate; selection follows modern design-tool conventions.
- Keyboard shortcuts for tools and history.

## 8. Accessibility

- Minimum 4.5:1 contrast, focus rings, ARIA labels, reduced-motion support.
