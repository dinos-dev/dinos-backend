import { RecommendationItem } from '../type/recommendation-item.type';

export class RecommendationResultEntity {
  constructor(
    public readonly userId: number,
    public readonly items: RecommendationItem[],
    public readonly updatedAt: Date,
  ) {}

  static fromRaw(userId: number, raw: unknown, updatedAt: Date): RecommendationResultEntity {
    const items = (raw as RecommendationItem[]) ?? [];
    return new RecommendationResultEntity(userId, items, updatedAt);
  }
}
