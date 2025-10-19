import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';
import { FriendWithActivityDto } from '../dto/friend-with-activity.dto';

export interface IFriendshipQuery {
  findAllFriendship(
    userId: number,
    paginationOptions?: PaginationOptions,
  ): Promise<PaginatedResult<FriendWithActivityDto>>;
}
