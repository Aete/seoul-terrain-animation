# 서울시 경계 GeoJSON

서울 마스크(`src/data/mask.ts`)에 쓰이는 실제 행정경계 데이터.
빌드 시 `?raw`로 번들에 포함된다(따릉이 CSV와 동일한 방식).

- `seoul_municipalities_geo_simple.json` — 서울 25개 자치구 폴리곤, mapshaper 단순화(경량, ~58KB). **마스크가 실제로 import 하는 파일.**
- `seoul_municipalities_geo.json` — 동일 데이터의 원본 전체 정밀도(~1.1MB, 참고/교체용).

각 feature `properties`: `code`, `name`(한글), `name_eng`, `base_year`.
geometry는 전부 `Polygon`. 전체 bbox ≈ `[126.766, 37.426, 127.186, 37.699]` —
`config.ts`의 `SEOUL_BOUNDS`와 일치. 25개 구를 합치면 서울시 외곽 경계.

출처: [southkorea/seoul-maps](https://github.com/southkorea/seoul-maps)
(`kostat/2013/json/`), 통계청 2013 기준. 라이선스: MIT.
