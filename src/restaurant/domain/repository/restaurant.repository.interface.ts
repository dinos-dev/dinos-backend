import { RestaurantEntity } from '../entities/restaurant.entity';

export interface IRestaurantRepository {
  upsertRestaurantByNameAndAddress(entity: RestaurantEntity): Promise<RestaurantEntity>;
}
