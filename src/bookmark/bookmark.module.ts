import { Module } from '@nestjs/common';
import { BookmarkService } from './application/bookmark.service';
import { BookmarkController } from './presentation/bookmark.controller';
import { BookmarkRepository } from './infrastructure/repository/bookmark.repository';
import { BOOKMARK_QUERY_REPOSITORY, BOOKMARK_REPOSITORY } from 'src/common/config/common.const';
import { BookmarkQueryRepository } from './infrastructure/query/bookmark.query';

@Module({
  controllers: [BookmarkController],
  providers: [
    BookmarkService,
    {
      provide: BOOKMARK_REPOSITORY,
      useClass: BookmarkRepository,
    },
    {
      provide: BOOKMARK_QUERY_REPOSITORY,
      useClass: BookmarkQueryRepository,
    },
  ],
})
export class BookmarkModule {}
