import { PlatformEnumType } from '../constant/platform.const';

export class TokenEntity {
  constructor(
    public readonly id: number | null,
    public readonly userId: number,
    public refToken: string,
    public expiresAt: Date,
    public platform: PlatformEnumType,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public version: number | null,
  ) {}

  static create(params: {
    userId: number;
    refToken: string;
    expiresAt: Date;
    platform: PlatformEnumType;
  }): TokenEntity {
    return new TokenEntity(null, params.userId, params.refToken, params.expiresAt, params.platform, null, null, null);
  }
}
