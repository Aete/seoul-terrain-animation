# src/layers/ — deck.gl layers + shaders

Up: [`../CLAUDE.md`](../CLAUDE.md) · Project: [`../../CLAUDE.md`](../../CLAUDE.md)

Renders a `Heightmap` (from `../data/field`) as a 3D contour surface.

- `ContourTerrainLayer.ts` — `Layer` subclass. Builds a cell-centered grid mesh
  (LNGLAT), injects the heightmap as an **R32F texture** (WebGL2-only), draws it
  as one non-instanced `Model`. Colors/interval/scale are props → UBO.
- `terrainUniforms.ts` — std140 UBO shader module (`terrain.*`), shared by vs+fs.
- `shaders/terrain.vs.glsl` — samples heightmap, displaces z by `heightScale`,
  `vMask = step(0, h)`, `project_position_to_clipspace`.
- `shaders/terrain.fs.glsl` — `fract+fwidth` contour lines, amber→cyan by height.
  Discards: masked cells (`vMask<0.5`) and flat noise-floor ground (`vHeight <
  interval*0.5`) — else the 0-level line fills flat plains solid.

Gotchas: R32F needs WebGL2; `fwidth` clamped `max(.,1e-4)` (blows up past ~80° pitch).