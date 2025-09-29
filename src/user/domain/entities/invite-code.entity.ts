export class InviteCodeEntity {
  constructor(
    public readonly id: number | null,
    public userId: number,
    public code: string,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
  ) {}

  static create(param: { userId: number; code: string }): InviteCodeEntity {
    return new InviteCodeEntity(null, param.userId, param.code, null, null);
  }
}
