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
}
