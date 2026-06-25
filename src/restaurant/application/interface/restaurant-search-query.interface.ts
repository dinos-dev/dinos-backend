import { RestaurantSearchQuery } from '../dto/restaurant-search.query';
import { RestaurantSearchResult } from '../dto/restaurant-search.result';

export interface IRestaurantSearchQuery {
  searchNearby(query: RestaurantSearchQuery): Promise<RestaurantSearchResult[]>;
}
