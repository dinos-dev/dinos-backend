import { Module } from '@nestjs/common';
import { ReviewService } from './application/review.service';
import { ReviewController } from './presentation/review.controller';
import { R2Module } from 'src/infrastructure/r2/r2.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [R2Module],
})
export class ReviewModule {}
