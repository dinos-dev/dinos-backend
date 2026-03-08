import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';
import { FriendWithActivityDto } from '../dto/friend-with-activity.dto';
import { SharedPinItemDto } from '../dto/shared-pins.dto';

export interface IFriendshipQuery {
  findAllFriendship(
    userId: number,
    paginationOptions?: PaginationOptions,
  ): Promise<PaginatedResult<FriendWithActivityDto>>;

  findSharedPins(userId: number): Promise<SharedPinItemDto[]>;
}
