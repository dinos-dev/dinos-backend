import { FriendshipEntity } from '../entities/friendship.entity';

export interface IFriendshipRepository {
  findById(id: number): Promise<FriendshipEntity>;
  findByUserPair(userIdA: number, userIdB: number): Promise<FriendshipEntity | null>;
  upsertFriendship(entity: FriendshipEntity): Promise<FriendshipEntity>;
  removeById(id: number): Promise<FriendshipEntity>;
}
