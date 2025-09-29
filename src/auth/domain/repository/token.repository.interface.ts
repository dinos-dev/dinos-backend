import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from '../entities/token.entity';
import { PlatformEnumType } from '../constant/platform.const';

export interface ITokenRepository {
  updateOrCreateRefToken(
    user: UserEntity,
    refToken: string,
    platform: PlatformEnumType,
    expiresAt: Date,
  ): Promise<TokenEntity>;
  deleteManyByUserId(userId: number): Promise<number>;
}
