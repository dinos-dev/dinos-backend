import { FriendshipEntity } from '../entities/friendship.entity';

export interface IFriendshipRepository {
  findById(id: number): Promise<FriendshipEntity>;
  upsertFriendship(entity: FriendshipEntity): Promise<FriendshipEntity>;
  removeById(id: number): Promise<FriendshipEntity>;
}
