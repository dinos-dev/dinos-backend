export class ReviewImageEntity {
  constructor(
    public readonly id: number,
    public readonly reviewId: number,
    public readonly imageUrl: string,
    public readonly isPrimary: boolean,
    public readonly sortOrder: number,
    public readonly createdAt: Date,
  ) {}

  static create(params: { imageUrl: string; isPrimary: boolean; sortOrder: number }): ReviewImageEntity {
    return new ReviewImageEntity(null, null, params.imageUrl, params.isPrimary, params.sortOrder, new Date());
  }
}
