import { PinEntity } from 'src/pin/domain/entities/pin.entity';
import { BoundingBoxDto } from '../dto/bounding-box.dto';
import { LocationQueryOptionsDto } from '../dto/location-query-options.dto';
import { PinWithRestaurantDto } from '../dto/pin-with-restaurant.dto';

export interface IPinQuery {
  findByUserIdAndRestaurantId(userId: number, restaurantId: number): Promise<PinEntity | null>;
  findNearbyPinnedRestaurants(
    userId: number,
    boundingBox: BoundingBoxDto,
    options: LocationQueryOptionsDto,
  ): Promise<PinWithRestaurantDto[]>;
}
