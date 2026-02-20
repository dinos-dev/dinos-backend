import { ReviewAnswerEntity } from '../entities/review-answer.entity';
import { ReviewEntity } from '../entities/review.entity';
import { ReviewImageEntity } from '../entities/review-image.entity';

export interface IReviewRepository {
  createWithAnswersAndImages(
    reviewEntity: ReviewEntity,
    answerEntities: ReviewAnswerEntity[],
    imageEntities: ReviewImageEntity[],
  ): Promise<ReviewEntity>;
}
