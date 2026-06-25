/**
 * 사용자 좌표 기반 음식점 키워드 검색 옵션
 * - API 입력은 기준 좌표/반경이지만, DB 인덱스를 활용하기 위해 내부적으로 bbox 범위를 함께 들고 간다.
 */
export class RestaurantSearchQuery {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly radiusMeters: number,
    public readonly minLat: number,
    public readonly maxLat: number,
    public readonly minLng: number,
    public readonly maxLng: number,
    public readonly keyword: string,
    public readonly limit: number,
  ) {}

  static create(params: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    keyword: string;
    limit?: number;
  }): RestaurantSearchQuery {
    const radiusMeters = params.radiusMeters ?? 10000;
    const radiusKm = radiusMeters / 1000;
    const latDelta = radiusKm / 111.32;
    const lngDenominator = Math.max(111.32 * Math.cos((params.latitude * Math.PI) / 180), 0.000001);
    const lngDelta = radiusKm / lngDenominator;

    return new RestaurantSearchQuery(
      params.latitude,
      params.longitude,
      radiusMeters,
      Math.max(params.latitude - latDelta, -90),
      Math.min(params.latitude + latDelta, 90),
      Math.max(params.longitude - lngDelta, -180),
      Math.min(params.longitude + lngDelta, 180),
      params.keyword,
      params.limit ?? 50,
    );
  }
}
