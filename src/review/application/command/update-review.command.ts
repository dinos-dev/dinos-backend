export class UpdateReviewAnswerCommand {
  constructor(
    public readonly questionId: number,
    public readonly optionId: number | null,
    public readonly customAnswer: string | null,
  ) {}
}

export class UpdateReviewImageCommand {
  constructor(
    public readonly imageUrl: string,
    public readonly isPrimary: boolean,
    public readonly sortOrder: number,
  ) {}
}

export class UpdateReviewCommand {
  constructor(
    public readonly reviewId: number,
    public readonly userId: number,
    public readonly content: string | null | undefined,
    public readonly wantRecommendation: boolean | undefined,
    public readonly answers: UpdateReviewAnswerCommand[] | undefined,
    public readonly images: UpdateReviewImageCommand[] | undefined,
  ) {}
}
