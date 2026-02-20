import { ReviewQuestionWithOptionsEntity } from 'src/review/domain/entities/review-question-with-options.entity';

export interface IReviewQuery {
  findAllActiveWithOptions(): Promise<ReviewQuestionWithOptionsEntity[]>;
}
