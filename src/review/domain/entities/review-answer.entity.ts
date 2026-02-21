export class ReviewAnswerEntity {
  constructor(
    public readonly id: number,
    public readonly reviewId: number,
    public readonly questionId: number,
    public readonly optionId: number | null,
    public readonly customAnswer: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    questionId: number;
    optionId?: number | null;
    customAnswer?: string | null;
  }): ReviewAnswerEntity {
    return new ReviewAnswerEntity(
      null,
      null,
      params.questionId,
      params.optionId ?? null,
      params.customAnswer ?? null,
      new Date(),
    );
  }
}
