import { PinEntity } from 'src/pin/domain/entities/pin.entity';

export interface IPinQuery {
  findByUserIdAndRestaurantId(userId: number, restaurantId: number): Promise<PinEntity | null>;
}
