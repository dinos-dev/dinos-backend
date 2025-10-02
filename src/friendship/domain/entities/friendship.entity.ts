export class FriendshipEntity {
  constructor(
    public readonly id: number | null,
    public readonly requesterId: number,
    public readonly addresseeId: number,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public version: number | null,
  ) {}

  static create(param: { requesterId: number; addresseeId: number }): FriendshipEntity {
    return new FriendshipEntity(null, param.requesterId, param.addresseeId, null, null, null);
  }
}
