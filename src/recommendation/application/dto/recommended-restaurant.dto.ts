/**
 * 식당 요약 정보
 * @param id 식당 ID
 * @param name 식당 이름
 * @param address 식당 주소
 * @param latitude 식당 위도
 * @param longitude 식당 경도
 * @param category 식당 카테고리
 * @param primaryImageUrl 식당 대표 이미지 URL
 */
export type RestaurantSummaryDto = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string | null;
  primaryImageUrl: string | null;
};

/**
 * 추천 기반이 된 사용자 프로필 정보
 * @param nickname 닉네임
 * @param comment 프로필 소개
 * @param headerId 헤더 ID
 * @param bodyId 바디 ID
 * @param headerColor 헤더 색상
 * @param bodyColor 바디 색상
 */
export type SourceUserProfileDto = {
  nickname: string;
  comment: string | null;
  headerId: number | null;
  bodyId: number | null;
  headerColor: string | null;
  bodyColor: string | null;
};

/**
 * 사용자별 임베딩된 배치 결과 리소스
 * @param restaurantId 식당 ID
 * @param score ML 추천 점수
 * @param matchRate ML match rate
 * @param sourceUserId 추천 기반이 된 사용자 ID
 * @param sourceReviewId 추천 기반이 된 리뷰 ID
 */
export class RecommendedRestaurantDto {
  constructor(
    public readonly restaurantId: number,
    public readonly score: number,
    public readonly matchRate: number,
    public readonly sourceUserId: number,
    public readonly sourceReviewId: number,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly category: string | null,
    public readonly primaryImageUrl: string | null,
    public readonly sourceUserProfile: SourceUserProfileDto | null,
  ) {}
}
