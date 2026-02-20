import { Module } from '@nestjs/common';
import { ReviewService } from './application/review.service';
import { ReviewController } from './presentation/review.controller';
import { R2Module } from 'src/infrastructure/r2/r2.module';
import { REVIEW_QUERY_REPOSITORY, REVIEW_QUESTION_REPOSITORY } from 'src/common/config/common.const';
import { ReviewQuestionRepository } from './infrastructure/repository/review-question.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ReviewQuery } from './infrastructure/query/review.query';

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
    PrismaService,
  ],
  imports: [R2Module],
})
export class ReviewModule {}
