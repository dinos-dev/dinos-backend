import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from '../entities/token.entity';
import { PlatFormEnumType } from '../constant/platform.const';

export interface ITokenRepository {
  updateOrCreateRefToken(
    user: UserEntity,
    refToken: string,
    platForm: PlatFormEnumType,
    expiresAt: Date,
  ): Promise<TokenEntity>;
  deleteManyByUserId(userId: number): Promise<number>;
}
