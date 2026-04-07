/**
 * Python ML 배치가 recommendation_results.recommendations 컬럼에 저장하는 JSON 구조
 * Python 쪽에서 camelCase로 적재하며, NestJS가 주 소비자이므로 camelCase를 계약(contract)으로 사용
 */
export type RecommendationItem = {
  restaurantId: number;
  score: number;
  matchRate: number;
  sourceUserId: number;
  sourceReviewId: number;
};
