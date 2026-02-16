import { ReviewStep } from 'src/review/domain/const/review.enum';

export interface CreateReviewQuestionOptionCommand {
  content: string;
  userTagLabel: string;
  sortOrder: number;
}

export class CreateReviewQuestionCommand {
  constructor(
    public readonly step: ReviewStep,
    public readonly content: string,
    public readonly sortOrder: number,
    public readonly options: CreateReviewQuestionOptionCommand[],
  ) {}
}
