# src/data/ — data layer (source-agnostic)

Up: [`../CLAUDE.md`](../CLAUDE.md) · Project: [`../../CLAUDE.md`](../../CLAUDE.md)

**Rule:** everything here and downstream depends only on `GeoPoint`, never on a
dataset's own fields. Dataset-specific mapping lives only in `sources/`.

- `types.ts` — `GeoPoint { lng, lat, weight, weightByHour? }`, `DataSource`, `Bounds`, `Heightmap`.
- `field.ts` — `computeHeightmap()`: full pipeline (KDE → mask → `Heightmap`). App imports this.
- `sources/` — one adapter per dataset; `index.ts` is the registry (`SOURCES`, `DEFAULT_SOURCE`).
  - `ttareungi.ts` — mock CSV (`?raw` import) → maps `tripCount→weight`, `[h0..h23]→weightByHour`.
  - Add a dataset: write an adapter, append to `SOURCES`. Don't touch heightmap/layers.
- `heightmap.ts` *(section 2)* — weighted KDE. **Log-weight; normalize by p99 clipping, NOT max.**
  Contribute only within σ×3; lng→m via `111320·cos(centerLat)`.
- `mask.ts` *(section 3)* — outside Seoul → value `-1` (shader discards). Han river is
  **not** masked (contour flows over it; river drawn as a flat overlay instead).
- `seoulGeo.ts` — parses real 25-자치구 boundary (`../../data/*_geo_simple.json?raw`) once;
  shared by `mask.ts` (`inSeoul`) and `layers/seoulBoundaryLayer.ts`.
