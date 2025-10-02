import { FriendRequestEntity } from '../entities/friend-request.entity';

export interface IFriendRequestRepository {
  upsertRequestFriendInvite(entity: FriendRequestEntity): Promise<FriendRequestEntity>;
}
