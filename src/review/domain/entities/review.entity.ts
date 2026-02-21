export class ReviewEntity {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly restaurantId: number,
    public readonly content: string | null,
    public readonly wantRecommendation: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date,
    public readonly version: number,
  ) {}

  static create(params: {
    userId: number;
    restaurantId: number;
    content?: string | null;
    wantRecommendation: boolean;
  }): ReviewEntity {
    return new ReviewEntity(
      null,
      params.userId,
      params.restaurantId,
      params.content ?? null,
      params.wantRecommendation,
      new Date(),
      new Date(),
      null,
      0,
    );
  }
}
