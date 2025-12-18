import { Bookmark, ItemType } from '@prisma/client';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';
import { ItemType as DomainItemType } from 'src/bookmark/domain/const/item-type.enum';

export function createMockBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: 1,
    userId: 1,
    itemType: ItemType.FEED,
    feedRefId: 'feedRefId',
    restaurantRefId: 'restaurantRefId',
    itemName: 'itemName',
    itemSub: 'itemSub',
    itemImageUrl: 'itemImageUrl',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockBookmarkEntity(
  overrides: Partial<{
    id: number | null;
    userId: number;
    itemType: DomainItemType;
    feedRefId: string;
    restaurantRefId: string;
    itemName: string;
    itemSub: string;
    itemImageUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }> = {
    id: 1,
    userId: 1,
    itemType: DomainItemType.FEED,
    feedRefId: 'feedRefId',
    restaurantRefId: 'restaurantRefId',
    itemName: 'itemName',
    itemSub: 'itemSub',
    itemImageUrl: 'itemImageUrl',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
): BookmarkEntity {
  const defaults = {
    id: 1,
    userId: 1,
    itemType: DomainItemType.FEED,
    feedRefId: 'feedRefId',
    restaurantRefId: 'restaurantRefId',
    itemName: 'itemName',
    itemSub: 'itemSub',
    itemImageUrl: 'itemImageUrl',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const merged = { ...defaults, ...overrides };
  return new BookmarkEntity(
    merged.id,
    merged.userId,
    merged.itemType,
    merged.feedRefId,
    merged.restaurantRefId,
    merged.itemName,
    merged.itemSub,
    merged.itemImageUrl,
    merged.createdAt,
    merged.updatedAt,
  );
}
