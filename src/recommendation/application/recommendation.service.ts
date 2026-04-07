import { Inject, Injectable } from '@nestjs/common';
import { RECOMMENDATION_QUERY_REPOSITORY } from 'src/common/config/common.const';
import { IRecommendationQuery } from './interface/recommendation-query.interface';
import { RecommendedRestaurantDto } from './dto/recommended-restaurant.dto';
import { RecommendationFilterDto } from './dto/recommendation-filter.dto';
import { DistanceFilter } from '../domain/const/distance-filter.enum';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject(RECOMMENDATION_QUERY_REPOSITORY)
    private readonly recommendationQuery: IRecommendationQuery,
  ) {}

  /**
   * 사용자별 임베딩된 배치 결과 리소스 조회
   * @param userId 유저 ID
   * @param filter 필터 (카테고리, 거리, 위도, 경도)
   * @returns 사용자별 임베딩된 배치 결과 리소스
   */
  async getMyRecommendations(
    userId: number,
    filter: RecommendationFilterDto = {},
  ): Promise<RecommendedRestaurantDto[]> {
    const items = await this.recommendationQuery.findRawItemsByUserId(userId);
    if (items.length === 0) return [];

    const restaurantIds = items.map((item) => item.restaurantId);
    const sourceUserIds = [...new Set(items.map((item) => item.sourceUserId))];

    const [restaurants, sourceUsers] = await Promise.all([
      this.recommendationQuery.findRestaurantSummariesByIds(restaurantIds),
      this.recommendationQuery.findSourceUserProfilesByIds(sourceUserIds),
    ]);

    const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));
    const sourceUserMap = new Map(sourceUsers.map((u) => [u.userId, u.profile]));

    let result = items
      .filter((item) => restaurantMap.has(item.restaurantId))
      .map((item) => {
        const r = restaurantMap.get(item.restaurantId)!;
        return new RecommendedRestaurantDto(
          r.id,
          item.score,
          item.matchRate,
          item.sourceUserId,
          item.sourceReviewId,
          r.name,
          r.address,
          r.latitude,
          r.longitude,
          r.category,
          r.primaryImageUrl,
          sourceUserMap.get(item.sourceUserId) ?? null,
        );
      });

    if (filter.category) {
      result = result.filter((r) => r.category === filter.category);
    }

    if (filter.distance !== undefined && filter.latitude !== undefined && filter.longitude !== undefined) {
      if (filter.distance !== DistanceFilter.NEAREST) {
        const radiusMeters = parseInt(filter.distance, 10);
        result = result.filter(
          (r) => this.calcDistance(filter.latitude!, filter.longitude!, r.latitude, r.longitude) <= radiusMeters,
        );
      }
      result.sort(
        (a, b) =>
          this.calcDistance(filter.latitude!, filter.longitude!, a.latitude, a.longitude) -
          this.calcDistance(filter.latitude!, filter.longitude!, b.latitude, b.longitude),
      );
    }

    return result;
  }

  /**
   * @Todo 추후 공용 헬퍼로 이동 예정
   * 두 좌표 사이의 거리를 계산하는 함수
   * @param lat1 첫 번째 좌표의 위도
   * @param lon1 첫 번째 좌표의 경도
   * @param lat2 두 번째 좌표의 위도
   * @param lon2 두 번째 좌표의 경도
   * @returns 두 좌표 사이의 거리 (미터)
   */
  private calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
