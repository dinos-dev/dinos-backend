export class ProfileEntity {
  constructor(
    public readonly id: number | null,
    public readonly userId: number,
    public nickname: string,
    public comment: string | null,
    public headerId: number | null,
    public bodyId: number | null,
    public headerColor: string | null,
    public bodyColor: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public version: number | null,
  ) {}

  static create(params: {
    userId: number;
    nickname: string;
    comment?: string | null;
    headerId?: number | null;
    bodyId?: number | null;
    headerColor?: string | null;
    bodyColor?: string | null;
  }): ProfileEntity {
    return new ProfileEntity(
      null,
      params.userId,
      params.nickname,
      params.comment ?? null,
      params.headerId ?? null,
      params.bodyId ?? null,
      params.headerColor ?? null,
      params.bodyColor ?? null,
      null,
      null,
      0,
    );
  }
}
