import { PlatFormEnumType, Prisma, Token } from '@prisma/client';
import { IRepository } from 'src/infrastructure/database/prisma/repository.interface';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from '../entities/token.entity';

export interface ITokenRepository extends IRepository<Token> {
  updateOrCreateRefToken(
    user: UserEntity,
    refToken: string,
    platForm: PlatFormEnumType,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<TokenEntity>;
  deleteManyByUserId(userId: number, tx?: Prisma.TransactionClient): Promise<number>;
}
