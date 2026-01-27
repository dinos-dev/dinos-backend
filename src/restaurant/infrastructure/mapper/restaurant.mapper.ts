import { Restaurant } from '@prisma/client';
import { RestaurantEntity } from 'src/restaurant/domain/entities/restaurant.entity';

export class RestaurantMapper {
  static toDomain(restaurant: Restaurant): RestaurantEntity {
    return new RestaurantEntity(
      restaurant.id,
      restaurant.name,
      restaurant.refPlaceId,
      restaurant.address,
      restaurant.latitude,
      restaurant.longitude,
      restaurant.webViewUrl,
      restaurant.lastSyncedAt,
      restaurant.isActive,
      restaurant.category,
      restaurant.createdAt,
      restaurant.updatedAt,
    );
  }
}
