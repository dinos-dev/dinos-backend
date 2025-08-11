import { Module } from '@nestjs/common';
import { FeedService } from './application/feed.service';
import { FeedController } from './presentation/feed.controller';

@Module({
  providers: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
