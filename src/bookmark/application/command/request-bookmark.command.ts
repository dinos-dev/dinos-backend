import { ItemType } from 'src/bookmark/domain/const/item-type.enum';

export class RequestBookmarkCommand {
  constructor(
    public readonly userId: number,
    public readonly feedRefId: string,
    public readonly restaurantRefId: string,
    public readonly itemName: string,
    public readonly itemImageUrl: string,
    public readonly itemSub: string,
    public readonly itemType: ItemType,
  ) {}
}
