import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';

export interface IBookmarkQuery {
  findByUniqueBookmark(
    userId: number,
    feedRefId: string,
    restaurantRefId?: string | null,
  ): Promise<BookmarkEntity | null>;
}
