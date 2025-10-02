import { FriendRequestStatus } from '../const/friend-request.enum';

export class FriendRequestEntity {
  constructor(
    public readonly id: number | null,
    public readonly senderId: number,
    public readonly receiverId: number,
    public readonly status: FriendRequestStatus,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public version: number | null,
  ) {}

  static create(param: { senderId: number; receiverId: number }): FriendRequestEntity {
    return new FriendRequestEntity(
      null,
      param.senderId,
      param.receiverId,
      FriendRequestStatus.PENDING,
      null,
      null,
      null,
    );
  }
}
