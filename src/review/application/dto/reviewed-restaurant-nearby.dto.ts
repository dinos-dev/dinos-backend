/**
 * 내가 리뷰한 가게(지도 마커 단위) + 핀 교차 정보
 * - 가게 단위로 dedupe (같은 가게 다중 리뷰는 최신 1건으로 접음)
 */
export class ReviewedRestaurantNearbyDto {
  constructor(
    public readonly restaurantId: number,
    public readonly restaurantName: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly address: string,
    public readonly category: string | null,
    public readonly primaryImageUrl: string | null,
    public readonly distanceKm: number,
    //? 내 최신 리뷰 (내용 + 최신 작성일)
    public readonly myReviewContent: string | null,
    public readonly lastReviewedAt: Date,
    //? 핀 교차 정보 - 내가 이 가게를 핀했는지
    public readonly isPinned: boolean,
    public readonly pinnedAt: Date | null,
    //? 이 가게를 나와 동일하게 핀한 친구 수
    public readonly friendPinCount: number,
  ) {}
}
