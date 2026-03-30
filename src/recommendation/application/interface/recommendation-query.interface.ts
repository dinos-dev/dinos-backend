import { RecommendedRestaurantDto } from '../dto/recommended-restaurant.dto';

export interface IRecommendationQuery {
  findRecommendedRestaurantsByUserId(userId: number): Promise<RecommendedRestaurantDto[]>;
}
