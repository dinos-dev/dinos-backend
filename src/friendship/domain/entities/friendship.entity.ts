import { FriendshipActivityEntity } from './friendship-activity.entity';

export class FriendshipEntity {
  constructor(
    public readonly id: number | null,
    public readonly requesterId: number,
    public readonly addresseeId: number,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public version: number | null,
    public readonly activities: FriendshipActivityEntity[] = [],
  ) {}

  static create(param: { requesterId: number; addresseeId: number }): FriendshipEntity {
    return new FriendshipEntity(null, param.requesterId, param.addresseeId, null, null, null);
  }

  // 현재 사용자 기준으로 친구 정보 추출
  getFriendInfo(currentUserId: number): { friendId: number; isRequester: boolean } {
    const isRequester = this.requesterId === currentUserId;
    return {
      friendId: isRequester ? this.addresseeId : this.requesterId,
      isRequester,
    };
  }
}
