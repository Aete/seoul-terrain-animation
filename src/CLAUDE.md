# src/ — code map

Entry point for the code. Project-level guidance: [`../CLAUDE.md`](../CLAUDE.md).

- `main.tsx` — React root.
- `App.tsx` — `DeckGL` scene (no basemap; dark bg). Holds view state + layer list.
- `config.ts` — `INITIAL_VIEW_STATE` (pitch 60), `SEOUL_BOUNDS`, unused `BASEMAP_STYLE`.
- `data/` — source-agnostic data + heightmap/mask. See [`data/CLAUDE.md`](data/CLAUDE.md).
- `layers/` — deck.gl contour + particle layers and GLSL shaders (added in section 4).
  See `layers/CLAUDE.md` once created.
- `ui/` — control panel (added in section 6).

Data flows: `data/sources` → `GeoPoint[]` → `data/heightmap` → `layers` → `App`.
Nothing outside `data/sources/` may reference dataset-specific fields.
