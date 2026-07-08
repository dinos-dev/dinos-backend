/**
 * 리뷰 지도 조회용 옵션 (bbox + 사용자 좌표 + limit)
 * - pin 도메인의 BoundingBoxDto/LocationQueryOptionsDto와 동일 개념이나,
 *   도메인 경계를 유지하기 위해 review 로컬로 둔다.
 */
export class NearbyReviewOptionsDto {
  constructor(
    public readonly userLat: number,
    public readonly userLng: number,
    public readonly minLat: number,
    public readonly maxLat: number,
    public readonly minLng: number,
    public readonly maxLng: number,
    public readonly limit: number,
  ) {}

  static create(params: {
    userLat: number;
    userLng: number;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    limit?: number;
  }): NearbyReviewOptionsDto {
    return new NearbyReviewOptionsDto(
      params.userLat,
      params.userLng,
      params.minLat,
      params.maxLat,
      params.minLng,
      params.maxLng,
      params.limit ?? 50,
    );
  }
}
