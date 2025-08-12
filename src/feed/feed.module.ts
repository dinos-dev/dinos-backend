import { Module } from '@nestjs/common';
import { FeedService } from './application/feed.service';
import { FeedController } from './presentation/feed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedSchema } from './infrastructure/feed.schema';
import { FeedRepository } from './infrastructure/feed.repository';
import { FEED_REPOSITORY } from 'src/common/config/common.const';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Feed', schema: FeedSchema }])],
  providers: [
    FeedService,
    {
      provide: FEED_REPOSITORY,
      useClass: FeedRepository,
    },
  ],
  controllers: [FeedController],
})
export class FeedModule {}
