import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';
import { FriendshipEntity } from '../entities/friendship.entity';

export interface IFriendshipRepository {
  upsertFriendship(entity: FriendshipEntity): Promise<FriendshipEntity>;
  findAllFriendship(userId: number, paginationOptions?: PaginationOptions): Promise<PaginatedResult<FriendshipEntity>>;
}
