# scripts/ — build-time scripts

Up: project [`../CLAUDE.md`](../CLAUDE.md). Run with `npx tsx scripts/<file>.ts` from repo root.
Standalone (no app imports); constants like Seoul bounds are duplicated here on purpose.

- `generateMockStations.ts` — writes `data/sample_stations.csv` (120 stations, log-normal
  `tripCount`, 4 hotspot clusters, bimodal 8h/18h hourly). Prints distribution stats. Rerun to reroll.
- `precomputeMask.ts` *(section 3)* — bakes the Seoul/Han mask to `data/seoul_mask.bin` (gitignored).
- `prepareGeoFeatures.ts` — reprojects raw river/park GeoJSON (**EPSG:5174**, meters) →
  WGS84, simplifies (turf), trims precision → `public/geo/{seoul_river,seoul_park}.geojson`
  (fetched at runtime). Rerun after replacing the raw `data/seoul_{river,park}.geojson`.
