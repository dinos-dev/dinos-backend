import { ReviewStep } from '../const/review.enum';

export class ReviewQuestionEntity {
  constructor(
    public readonly id: number,
    public readonly step: ReviewStep,
    public readonly content: string,
    public readonly isActive: boolean,
    public readonly sortOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: { step: ReviewStep; content: string; sortOrder: number }): ReviewQuestionEntity {
    return new ReviewQuestionEntity(null, params.step, params.content, true, params.sortOrder, new Date(), new Date());
  }
}
