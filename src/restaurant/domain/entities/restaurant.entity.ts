export class RestaurantEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly refPlaceId: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly webviewUrl: string,
    public readonly lastSyncedAt: Date,
    public readonly isActive: boolean,
    public readonly category: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    name: string;
    refPlaceId: string;
    address: string;
    latitude: number;
    longitude: number;
    webviewUrl: string;
  }): RestaurantEntity {
    return new RestaurantEntity(
      null,
      params.name,
      params.refPlaceId,
      params.address,
      params.latitude,
      params.longitude,
      params.webviewUrl,
      new Date(),
      true,
      null,
      new Date(),
      new Date(),
    );
  }
}
