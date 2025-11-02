import { Inject, Injectable } from '@nestjs/common';
import { IBookmarkRepository } from '../domain/repository/bookmark.repository.interface';
import { BOOKMARK_QUERY_REPOSITORY, BOOKMARK_REPOSITORY } from 'src/common/config/common.const';
import { IBookmarkQuery } from './interface/bookmark-query.interface';
import { BookmarkEntity } from '../domain/entity/bookmark.entity';
import { RequestBookmarkCommand } from './command/request-bookmark.command';

@Injectable()
export class BookmarkService {
  constructor(
    @Inject(BOOKMARK_REPOSITORY)
    private readonly bookmarkRepository: IBookmarkRepository,
    @Inject(BOOKMARK_QUERY_REPOSITORY)
    private readonly bookmarkQuery: IBookmarkQuery,
  ) {}

  /**
   * 북마크 생성 또는 제거 ( toggle )
   * @param command
   * @returns BookmarkEntity
   */
  async toggleBookmark(
    command: RequestBookmarkCommand,
  ): Promise<{ bookmark: BookmarkEntity; action: 'create' | 'delete' }> {
    const findUniqueBookmark = await this.bookmarkQuery.findByUniqueBookmark(
      command.userId,
      command.feedRefId,
      command.restaurantRefId,
    );

    let bookmark: BookmarkEntity;

    //? 북마크가 존재할 경우 hard delete
    if (findUniqueBookmark) {
      bookmark = await this.bookmarkRepository.removeById(findUniqueBookmark.id);
      return { bookmark, action: 'delete' };
    }

    //? 북마크 Entity 생성
    const bookmarkEntity = BookmarkEntity.create(command);
    console.log('!!!!!!!!!!!!!!!!!!!!bookmarkEntity', bookmarkEntity);

    //? 북마크 없을 경우 create
    bookmark = await this.bookmarkRepository.create(bookmarkEntity);
    return { bookmark, action: 'create' };
  }
}
