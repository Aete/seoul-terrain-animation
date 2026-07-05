# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Per-folder notes live in nested CLAUDE.md files — read the one for the folder you're in:
- `src/CLAUDE.md` — code map (entry point)
- `src/data/CLAUDE.md` — data layer
- `src/layers/CLAUDE.md` — deck.gl layers + shaders (added in section 4)
- `scripts/CLAUDE.md` — build scripts

This file stays project-level only.

## Project

Seoul scalar field rendered as **contour lines only** (topographic-poster / Joy Division
aesthetic), with GPU particles flowing over the terrain and hourly time-of-day variation.
First dataset is Ttareungi (public bike) usage; the data layer is **source-agnostic**.

Spec/plan/commits are in Korean, code identifiers in English — match that.

## Commands

- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — `tsc -b && vite build`
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run lint` — oxlint (not eslint)

No test runner. Verify each increment visually via `npm run dev`.

## Architecture

Pipeline: **data adapter → KDE heightmap → contour shader → GPU particles**, rendered by
deck.gl in `src/App.tsx`. The whole pipeline depends only on a generic `GeoPoint` model,
never on dataset-specific fields. Code map in `src/CLAUDE.md`.

**No basemap** — the contour terrain is the focus; deck.gl renders on a plain dark
background (`index.css`). The maplibre basemap was intentionally dropped (config kept for
optional re-add).

## Conventions

- React 19, TypeScript 6 `strict` + `verbatimModuleSyntax` (use `import type`), Vite, deck.gl 9.
- GLSL (`.glsl/.vs/.fs/.vert/.frag`) imports as strings; decls in `src/vite-env.d.ts`.
- `src/config.ts` — Seoul `INITIAL_VIEW_STATE` (pitch 60) + `SEOUL_BOUNDS`.

## Working style

Build in incremental, visually-verified steps; stop for a screenshot at each section end.
Staged plan: `~/.claude/plans/seoul-ttareungi-contour-eager-patterson.md`.
Status: sections 0–4 done (bootstrap → data → heightmap → mask → contour terrain).
Next: section 5 (GPU particles).
