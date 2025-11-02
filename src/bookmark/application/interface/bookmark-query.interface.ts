import { ItemType } from 'src/bookmark/domain/const/item-type.enum';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';
import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';

export interface IBookmarkQuery {
  findByUniqueBookmark(
    userId: number,
    feedRefId: string,
    restaurantRefId?: string | null,
  ): Promise<BookmarkEntity | null>;

  findFilterBookmark(
    userId: number,
    itemType: ItemType,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<BookmarkEntity>>;
}
