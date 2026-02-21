// import { PinType } from 'src/pin/domain/const/pin.enum';

export class LocationQueryOptionsDto {
  constructor(
    public readonly userLat: number,
    public readonly userLng: number,
    public readonly limit: number,
    // public readonly type?: PinType,
  ) {}

  static create(params: { userLat: number; userLng: number; limit?: number }): LocationQueryOptionsDto {
    return new LocationQueryOptionsDto(params.userLat, params.userLng, params.limit ?? 30);
  }
}
