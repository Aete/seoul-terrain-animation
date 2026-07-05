# Seoul Terrain Animation

서울시 데이터를 **등고선만으로** 표현한 3D terrain 시각화. 지형 위를 GPU 파티클이 흐르는 애니메이션과
시간대별 밀도 변화를 함께 보여준다.

첫 데이터 소스는 서울시 **따릉이(공공자전거)** 대여소 사용량이지만, 데이터 계층은
**소스 중립적**으로 설계한다 — 인구밀도·지하철 승하차·상권 활성도 등 다른 데이터셋도
어댑터 추가만으로 붙일 수 있다. 코어 모델은 가중치를 가진 지오포인트
(`GeoPoint { lng, lat, weight, weightByHour? }`) + `DataSource` 어댑터 인터페이스.

## Stack (예정)
Vite · React 18 · TypeScript · deck.gl 9 · react-map-gl / maplibre-gl ·
d3-contour / d3-geo · vite-plugin-glsl

## Status
초기 단계 — 구현 계획 수립 중. Vite 부트스트랩은 아직 진행 전.
