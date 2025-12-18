import { BOOKMARK_CONSTANTS } from 'src/bookmark/domain/const/bookmark.const';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';

describe('BookmarkEntity', () => {
  describe('create', () => {
    it('올바른 파라미터로 BookmarkEntity를 생성한다 ( FEED 타입 )', () => {
      // 1. given
      const params = {
        userId: 1,
        itemType: ItemType.FEED,
        feedRefId: '94ldz0344dCO21',
        itemName: '한남동 브런치 느낌 있잖아',
        itemSub: '핫 다이노',
        itemImageUrl: 'https://example.com/thumbnail.jpg',
      };

      // 2. when
      const bookmark = BookmarkEntity.create(params);

      // 3. then
      expect(bookmark.userId).toBe(params.userId);
      expect(bookmark.itemType).toBe(params.itemType);
      expect(bookmark.feedRefId).toBe(params.feedRefId);
      expect(bookmark.restaurantRefId).toBe(BOOKMARK_CONSTANTS.FEED_SENTINEL);
      expect(bookmark.itemName).toBe(params.itemName);
      expect(bookmark.itemSub).toBe(params.itemSub);
      expect(bookmark.itemImageUrl).toBe(params.itemImageUrl);
      expect(bookmark.id).toBeNull();
    });
    it('itemType이 RESTAURANT 값일 경우에 restaurantRefId 파라미터를 기반으로 bookmarkEntity를 생성한다.', () => {
      // 1. given
      const params = {
        userId: 1,
        itemType: ItemType.RESTAURANT,
        feedRefId: 'feedRefId',
        restaurantRefId: 'restaurantRefId',
        itemName: '한남동 돈까스 맛집',
        itemSub: '한남동의 맛집 돈까스 집들을 구경하세요',
        itemImageUrl: 'https://example.com/thumbnail.jpg',
      };
      // 2. when
      const bookmark = BookmarkEntity.create(params);

      // 3. then
      expect(bookmark.restaurantRefId).not.toBe(BOOKMARK_CONSTANTS.FEED_SENTINEL);
      expect(bookmark.restaurantRefId).toBe(params.restaurantRefId);
    });
  });
});
