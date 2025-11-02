import { BOOKMARK_CONSTANTS } from '../const/bookmark.const';
import { ItemType } from '../const/item-type.enum';

export class BookmarkEntity {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly itemType: ItemType,
    public readonly feedRefId: string,
    public readonly restaurantRefId: string,
    public readonly itemName: string,
    public readonly itemImageUrl: string | null,
    public readonly itemSub: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(param: {
    userId: number;
    itemType: ItemType;
    feedRefId: string;
    restaurantRefId?: string | null; // null when itemType is FEED
    itemName: string;
    itemImageUrl?: string | null;
    itemSub: string;
  }): BookmarkEntity {
    //? FEED 타입일 경우 RestaurantRefId를 센티널 값으로 변환 ( race condition & unique constraint 방지 )
    const normalizedRestaurantId =
      param.itemType === ItemType.FEED ? BOOKMARK_CONSTANTS.FEED_SENTINEL : param.restaurantRefId!;

    return new BookmarkEntity(
      null,
      param.userId,
      param.itemType,
      param.feedRefId,
      normalizedRestaurantId,
      param.itemName,
      param.itemImageUrl ?? null,
      param.itemSub,
      new Date(),
      new Date(),
    );
  }

  // 외부로 노출할 때는 센티널 값을 null로 변환
  getRestaurantRefId(): string | null {
    return this.restaurantRefId === BOOKMARK_CONSTANTS.FEED_SENTINEL ? null : this.restaurantRefId;
  }

  // FEED 타입인지 체크
  isFeedBookmark(): boolean {
    return this.itemType === ItemType.FEED;
  }
}
