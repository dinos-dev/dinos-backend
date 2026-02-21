import { CursorPaginatedResult } from 'src/common/types/pagination.types';
import { MyReviewEntity } from 'src/review/domain/entities/my-review.entity';
import { ReviewQuestionWithOptionsEntity } from 'src/review/domain/entities/review-question-with-options.entity';

export interface IReviewQuery {
  findAllActiveWithOptions(): Promise<ReviewQuestionWithOptionsEntity[]>;
  findMyReviews(userId: number, cursor: number | null, limit: number): Promise<CursorPaginatedResult<MyReviewEntity>>;
}
