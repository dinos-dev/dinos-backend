import { FriendRequestEntity } from '../entities/friend-request.entity';

export interface IFriendRequestRepository {
  findById(id: number): Promise<FriendRequestEntity | null>;
  upsertRequestFriendInvite(entity: FriendRequestEntity): Promise<FriendRequestEntity>;
  findByReceiveId(receiveId: number): Promise<FriendRequestEntity[]>;
}
