import { UserEntity } from 'src/user/domain/entities/user.entity';
import { FriendRequestStatus } from '../const/friend-request.enum';

export class FriendRequestEntity {
  constructor(
    public readonly id: number | null,
    public readonly senderId: number,
    public readonly receiverId: number,
    public readonly status: FriendRequestStatus,
    public readonly respondedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public version: number | null,
    public readonly sender?: UserEntity,
    public readonly receiver?: UserEntity,
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
      null,
      null,
      undefined,
      undefined,
    );
  }
}
