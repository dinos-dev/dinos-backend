export class MyReviewAnswerData {
  constructor(
    public readonly questionId: number,
    public readonly questionContent: string,
    public readonly optionId: number | null,
    public readonly optionContent: string | null,
    public readonly customAnswer: string | null,
  ) {}
}

export class MyReviewImageData {
  constructor(
    public readonly imageUrl: string,
    public readonly isPrimary: boolean,
    public readonly sortOrder: number,
  ) {}
}

export class MyReviewEntity {
  constructor(
    public readonly id: number,
    public readonly content: string | null,
    public readonly wantRecommendation: boolean,
    public readonly createdAt: Date,
    public readonly restaurantName: string,
    public readonly restaurantAddress: string,
    public readonly answers: MyReviewAnswerData[],
    public readonly images: MyReviewImageData[],
  ) {}
}
