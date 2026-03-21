export class RestaurantEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly lastSyncedAt: Date,
    public readonly isActive: boolean,
    public readonly category: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category?: string | null;
  }): RestaurantEntity {
    return new RestaurantEntity(
      null,
      params.name,
      params.address,
      params.latitude,
      params.longitude,
      new Date(),
      true,
      params.category ?? null,
      new Date(),
      new Date(),
    );
  }
}
