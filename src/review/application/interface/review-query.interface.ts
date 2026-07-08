import { CursorPaginatedResult } from 'src/common/types/pagination.types';
import { MyReviewEntity } from 'src/review/domain/entities/my-review.entity';
import { ReviewDetailEntity } from 'src/review/domain/entities/review-detail.entity';
import { ReviewQuestionWithOptionsEntity } from 'src/review/domain/entities/review-question-with-options.entity';
import { NearbyReviewOptionsDto } from '../dto/nearby-review-options.dto';
import { ReviewedRestaurantNearbyDto } from '../dto/reviewed-restaurant-nearby.dto';

export interface IReviewQuery {
  findAllActiveWithOptions(): Promise<ReviewQuestionWithOptionsEntity[]>;
  findMyReviews(userId: number, cursor: number | null, limit: number): Promise<CursorPaginatedResult<MyReviewEntity>>;
  findReviewDetail(reviewId: number, userId: number): Promise<ReviewDetailEntity | null>;
  countWrapUpAmongIds(questionIds: number[]): Promise<number>;
  findNearbyReviewedRestaurants(
    userId: number,
    options: NearbyReviewOptionsDto,
  ): Promise<ReviewedRestaurantNearbyDto[]>;
}
