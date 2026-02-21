import { ReviewStep } from '../const/review.enum';

export class ReviewDetailOptionData {
  constructor(
    public readonly id: number,
    public readonly content: string,
    public readonly sortOrder: number,
  ) {}
}

export class ReviewDetailQuestionData {
  constructor(
    public readonly id: number,
    public readonly content: string,
    public readonly options: ReviewDetailOptionData[],
  ) {}
}

export class ReviewDetailUserAnswerData {
  constructor(
    public readonly optionId: number | null,
    public readonly customAnswer: string | null,
  ) {}
}

export class ReviewDetailStepData {
  constructor(
    public readonly step: ReviewStep,
    public readonly question: ReviewDetailQuestionData,
    public readonly userAnswer: ReviewDetailUserAnswerData,
  ) {}
}

export class ReviewDetailImageData {
  constructor(
    public readonly imageUrl: string,
    public readonly isPrimary: boolean,
    public readonly sortOrder: number,
  ) {}
}

export class ReviewDetailEntity {
  constructor(
    public readonly id: number,
    public readonly content: string | null,
    public readonly wantRecommendation: boolean,
    public readonly createdAt: Date,
    public readonly restaurantName: string,
    public readonly restaurantAddress: string,
    public readonly steps: ReviewDetailStepData[],
    public readonly images: ReviewDetailImageData[],
  ) {}
}
