import { RestaurantEntity } from '../entities/restaurant.entity';

export interface IRestaurantRepository {
  upsertRestaurantByRefPlaceId(entity: RestaurantEntity): Promise<RestaurantEntity>;
  findByRefPlaceId(refPlaceId: string): Promise<RestaurantEntity | null>;
}
