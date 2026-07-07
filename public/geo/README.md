# public/geo — 서울시 경계 GeoJSON

서울 마스크(`src/data/mask.ts`)에 쓰기 위한 실제 행정경계 데이터.

- `seoul_municipalities_geo.json` — 서울 25개 자치구 폴리곤 (원본, 전체 정밀도).
- `seoul_municipalities_geo_simple.json` — 동일 데이터의 mapshaper 단순화 버전(경량).

각 feature `properties`: `code`, `name`(한글), `name_eng`, `base_year`.
전체 bbox ≈ `[126.766, 37.426, 127.186, 37.699]` — `config.ts`의 `SEOUL_BOUNDS`와 일치.
25개 구를 union 하면 서울시 외곽 경계가 된다.

출처: [southkorea/seoul-maps](https://github.com/southkorea/seoul-maps)
(`kostat/2013/json/`), 통계청 2013 기준. 라이선스: MIT.
