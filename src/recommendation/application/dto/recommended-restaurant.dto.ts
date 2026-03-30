export class RecommendedRestaurantDto {
  constructor(
    public readonly restaurantId: number,
    public readonly score: number,
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly category: string | null,
    public readonly primaryImageUrl: string | null,
  ) {}
}
