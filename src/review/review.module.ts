import { Module } from '@nestjs/common';
import { ReviewService } from './application/review.service';
import { ReviewController } from './presentation/review.controller';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
