import { BookmarkEntity } from '../entity/bookmark.entity';

export interface IBookmarkRepository {
  create(entity: BookmarkEntity): Promise<BookmarkEntity>;
  updateById(id: number, entity: BookmarkEntity): Promise<BookmarkEntity>;
  removeById(id: number): Promise<BookmarkEntity>;
}
