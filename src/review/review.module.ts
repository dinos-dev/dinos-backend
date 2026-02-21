import { Module } from '@nestjs/common';
import { ReviewService } from './application/review.service';
import { ReviewController } from './presentation/review.controller';
import { R2Module } from 'src/infrastructure/r2/r2.module';
import {
  RESTAURANT_REPOSITORY,
  REVIEW_QUERY_REPOSITORY,
  REVIEW_QUESTION_REPOSITORY,
  REVIEW_REPOSITORY,
} from 'src/common/config/common.const';
import { ReviewQuestionRepository } from './infrastructure/repository/review-question.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ReviewQuery } from './infrastructure/query/review.query';
import { ReviewRepository } from './infrastructure/repository/review.repository';
import { RestaurantRepository } from 'src/restaurant/infrastructure/repository/restaurant.repository';

@Module({
  controllers: [ReviewController],
  providers: [
    ReviewService,
    {
      provide: REVIEW_QUESTION_REPOSITORY,
      useClass: ReviewQuestionRepository,
    },
    {
      provide: REVIEW_QUERY_REPOSITORY,
      useClass: ReviewQuery,
    },
    {
      provide: REVIEW_REPOSITORY,
      useClass: ReviewRepository,
    },
    {
      provide: RESTAURANT_REPOSITORY,
      useClass: RestaurantRepository,
    },
    PrismaService,
  ],
  imports: [R2Module],
})
export class ReviewModule {}
