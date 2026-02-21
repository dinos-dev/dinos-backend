// import { PinType } from 'src/pin/domain/const/pin.enum';

export class PinWithRestaurantDto {
  constructor(
    public readonly pinId: number,
    public readonly restaurantId: number,
    public readonly restaurantName: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly address: string,
    public readonly category: string | null,
    public readonly distanceKm: number,
    // public readonly pinType: PinType,
    public readonly pinnedAt: Date,
  ) {}
}
