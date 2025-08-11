import { Controller } from '@nestjs/common';
import { FeedService } from '../application/feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}
}
