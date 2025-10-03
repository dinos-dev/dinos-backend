import { FriendshipEntity } from '../entities/friendship.entity';

export interface IFriendshipRepository {
  upsertFriendship(entity: FriendshipEntity): Promise<FriendshipEntity>;
}
