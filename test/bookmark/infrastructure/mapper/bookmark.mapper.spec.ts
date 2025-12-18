import { BookmarkMapper } from 'src/bookmark/infrastructure/mapper/bookmark.mapper';
import { createMockBookmark } from '../../../__mocks__/bookmark.factory';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';

describe('BookmarkMapper', () => {
  describe('toDomain', () => {
    it('Prisma Bookmark 모델을 BookmarkEntity로 변환한다.', () => {
      // 1. given
      const prismaBookmark = createMockBookmark();

      // 2. when
      const result = BookmarkMapper.toDomain(prismaBookmark);

      // 3. then
      expect(result).toBeInstanceOf(BookmarkEntity);
      expect(result.id).toBe(prismaBookmark.id);
      expect(result.userId).toBe(prismaBookmark.userId);
      expect(result.itemType).toBe(prismaBookmark.itemType);
      expect(result.feedRefId).toBe(prismaBookmark.feedRefId);
      expect(result.restaurantRefId).toBe(prismaBookmark.restaurantRefId);
      expect(result.itemName).toBe(prismaBookmark.itemName);
      expect(result.itemImageUrl).toBe(prismaBookmark.itemImageUrl);
      expect(result.itemSub).toBe(prismaBookmark.itemSub);
      expect(result.createdAt).toBe(prismaBookmark.createdAt);
      expect(result.updatedAt).toBe(prismaBookmark.updatedAt);
    });

    it('FEED 타입의 북마크를 올바르게 변환한다.', () => {
      // 1. given
      const prismaBookmark = createMockBookmark({
        itemType: 'FEED' as any,
        restaurantRefId: '__FEED_ONLY__',
      });

      // 2. when
      const result = BookmarkMapper.toDomain(prismaBookmark);

      // 3. then
      expect(result.itemType).toBe(ItemType.FEED);
      expect(result.restaurantRefId).toBe('__FEED_ONLY__');
    });

    it('RESTAURANT 타입의 북마크를 올바르게 변환한다.', () => {
      // 1. given
      const prismaBookmark = createMockBookmark({
        itemType: 'RESTAURANT' as any,
        restaurantRefId: 'restaurant123',
      });

      // 2. when
      const result = BookmarkMapper.toDomain(prismaBookmark);

      // 3. then
      expect(result.itemType).toBe(ItemType.RESTAURANT);
      expect(result.restaurantRefId).toBe('restaurant123');
    });

    it('itemImageUrl이 null인 경우도 올바르게 변환한다.', () => {
      // 1. given
      const prismaBookmark = createMockBookmark({
        itemImageUrl: null,
      });

      // 2. when
      const result = BookmarkMapper.toDomain(prismaBookmark);

      // 3. then
      expect(result.itemImageUrl).toBeNull();
    });

    it('모든 필드가 올바른 타입으로 변환되는지 확인한다.', () => {
      // 1. given
      const now = new Date();
      const prismaBookmark = createMockBookmark({
        id: 42,
        userId: 100,
        itemType: 'FEED' as any,
        feedRefId: 'feed-ref-123',
        restaurantRefId: 'restaurant-ref-456',
        itemName: 'Test Item',
        itemImageUrl: 'https://example.com/image.jpg',
        itemSub: 'Test Sub',
        createdAt: now,
        updatedAt: now,
      });

      // 2. when
      const result = BookmarkMapper.toDomain(prismaBookmark);

      // 3. then
      expect(typeof result.id).toBe('number');
      expect(typeof result.userId).toBe('number');
      expect(typeof result.itemType).toBe('string');
      expect(typeof result.feedRefId).toBe('string');
      expect(typeof result.restaurantRefId).toBe('string');
      expect(typeof result.itemName).toBe('string');
      expect(typeof result.itemImageUrl).toBe('string');
      expect(typeof result.itemSub).toBe('string');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});
