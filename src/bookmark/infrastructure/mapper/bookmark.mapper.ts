import { Bookmark as BookmarkPrisma } from '@prisma/client';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';

export class BookmarkMapper {
  static toDomain(prismaBookmark: BookmarkPrisma): BookmarkEntity {
    return new BookmarkEntity(
      prismaBookmark.id,
      prismaBookmark.userId,
      prismaBookmark.itemType as ItemType,
      prismaBookmark.feedRefId,
      prismaBookmark.restaurantRefId,
      prismaBookmark.itemName,
      prismaBookmark.itemImageUrl,
      prismaBookmark.itemSub,
      prismaBookmark.createdAt,
      prismaBookmark.updatedAt,
    );
  }
}
