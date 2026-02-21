import { ReviewAnswerEntity } from '../entities/review-answer.entity';
import { ReviewEntity } from '../entities/review.entity';
import { ReviewImageEntity } from '../entities/review-image.entity';

export interface ReviewUpdateData {
  content?: string | null;
  wantRecommendation?: boolean;
  answers?: ReviewAnswerEntity[];
  images?: ReviewImageEntity[];
}

export interface IReviewRepository {
  createWithAnswersAndImages(
    reviewEntity: ReviewEntity,
    answerEntities: ReviewAnswerEntity[],
    imageEntities: ReviewImageEntity[],
  ): Promise<ReviewEntity>;

  updateReview(reviewId: number, userId: number, data: ReviewUpdateData): Promise<boolean>;
  softDeleteReview(reviewId: number, userId: number): Promise<boolean>;
}
