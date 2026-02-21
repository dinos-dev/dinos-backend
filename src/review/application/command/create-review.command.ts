export class CreateReviewAnswerCommand {
  constructor(
    public readonly questionId: number,
    public readonly optionId: number | null,
    public readonly customAnswer: string | null,
  ) {}
}

export class CreateReviewImageCommand {
  constructor(
    public readonly imageUrl: string,
    public readonly isPrimary: boolean,
    public readonly sortOrder: number,
  ) {}
}

export class CreateReviewRestaurantCommand {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}
}

export class CreateReviewCommand {
  constructor(
    public readonly userId: number,
    public readonly restaurant: CreateReviewRestaurantCommand,
    public readonly content: string | null,
    public readonly wantRecommendation: boolean,
    public readonly answers: CreateReviewAnswerCommand[],
    public readonly images: CreateReviewImageCommand[],
  ) {}
}
