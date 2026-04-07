import { RecommendationItem } from 'src/recommendation/domain/type/recommendation-item.type';
import { RestaurantSummaryDto, SourceUserProfileDto } from '../dto/recommended-restaurant.dto';

export interface IRecommendationQuery {
  findRawItemsByUserId(userId: number): Promise<RecommendationItem[]>;
  findRestaurantSummariesByIds(ids: number[]): Promise<RestaurantSummaryDto[]>;
  findSourceUserProfilesByIds(ids: number[]): Promise<{ userId: number; profile: SourceUserProfileDto | null }[]>;
}
