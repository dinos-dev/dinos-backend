import { ItemType } from '../const/item-type.enum';

export class BookmarkEntity {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly itemType: ItemType,
    public readonly feedRefId: string,
    public readonly restaurantRefId: string | null,
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
    restaurantRefId?: string | null;
    itemName: string;
    itemImageUrl?: string | null;
    itemSub: string;
  }): BookmarkEntity {
    return new BookmarkEntity(
      null,
      param.userId,
      param.itemType,
      param.feedRefId,
      param.restaurantRefId,
      param.itemName,
      param.itemImageUrl,
      param.itemSub,
      new Date(),
      new Date(),
    );
  }
}
