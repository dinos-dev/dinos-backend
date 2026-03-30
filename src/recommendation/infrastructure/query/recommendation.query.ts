import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { IRecommendationQuery } from 'src/recommendation/application/interface/recommendation-query.interface';
import { RecommendedRestaurantDto } from 'src/recommendation/application/dto/recommended-restaurant.dto';
import { RecommendationItem } from 'src/recommendation/domain/type/recommendation-item.type';

@Injectable()
export class RecommendationQuery implements IRecommendationQuery {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * userId 기반으로 ML 추천 결과 + 식당 상세 정보를 조합하여 반환
   * - recommendation_results 에서 JSON 배열 조회
   * - restaurant_ids로 restaurants 테이블 조회
   * - Python 배치가 계산한 score 순서 유지
   */
  async findRecommendedRestaurantsByUserId(userId: number): Promise<RecommendedRestaurantDto[]> {
    const result = await this.prisma.recommendationResult.findUnique({
      where: { userId },
    });

    if (!result) return [];

    const items = result.recommendations as RecommendationItem[];
    if (!items.length) return [];

    const restaurantIds = items.map((item) => item.restaurant_id);

    const restaurants = await this.prisma.restaurant.findMany({
      where: { id: { in: restaurantIds } },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        category: true,
        primaryImageUrl: true,
      },
    });

    const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));

    return items
      .filter((item) => restaurantMap.has(item.restaurant_id))
      .map((item) => {
        const r = restaurantMap.get(item.restaurant_id)!;
        return new RecommendedRestaurantDto(
          r.id,
          item.score,
          r.name,
          r.address,
          r.latitude,
          r.longitude,
          r.category,
          r.primaryImageUrl,
        );
      });
  }
}
