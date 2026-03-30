import { Inject, Injectable } from '@nestjs/common';
import { RECOMMENDATION_QUERY_REPOSITORY } from 'src/common/config/common.const';
import { IRecommendationQuery } from './interface/recommendation-query.interface';
import { RecommendedRestaurantDto } from './dto/recommended-restaurant.dto';

@Injectable()
export class RecommendationService {
  constructor(
    @Inject(RECOMMENDATION_QUERY_REPOSITORY)
    private readonly recommendationQuery: IRecommendationQuery,
  ) {}

  /**
   * 사용자 개인화 추천 식당 목록 조회
   * @param userId 사용자 ID
   * @returns ML 배치가 계산한 추천 식당 목록 (score 내림차순, 최대 20개)
   */
  async getMyRecommendations(userId: number): Promise<RecommendedRestaurantDto[]> {
    return this.recommendationQuery.findRecommendedRestaurantsByUserId(userId);
  }
}
