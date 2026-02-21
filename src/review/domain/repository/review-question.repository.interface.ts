import { ReviewQuestionEntity } from '../entities/review-question.entity';
import { ReviewQuestionOptionEntity } from '../entities/review-question-option.entity';

export interface IReviewQuestionRepository {
  createWithOptions(
    questionEntity: ReviewQuestionEntity,
    optionEntities: ReviewQuestionOptionEntity[],
  ): Promise<ReviewQuestionEntity>;

  // createReview()
}
