/**
 * 사용자 좌표 기반 식당명 검색 결과
 * - distanceKm: 기준 좌표와 식당 좌표 사이의 거리(km)
 */
export class RestaurantSearchResult {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly category: string | null,
    public readonly primaryImageUrl: string | null,
    public readonly distanceKm: number,
  ) {}
}
