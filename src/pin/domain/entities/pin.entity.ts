import { PinType } from '../const/pin.enum';

export class PinEntity {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly restaurantId: number,
    public readonly reviewId: number | null,
    public readonly type: PinType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: { userId: number; restaurantId: number; reviewId: number | null; type: PinType }): PinEntity {
    return new PinEntity(
      null,
      params.userId,
      params.restaurantId,
      params.reviewId,
      params.type,
      new Date(),
      new Date(),
    );
  }
}
