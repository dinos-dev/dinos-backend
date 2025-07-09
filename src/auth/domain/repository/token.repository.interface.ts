import { PlatFormEnumType, Prisma, Token, User } from '@prisma/client';
import { IRepository } from 'src/infrastructure/database/prisma/repository.interface';

export interface ITokenRepository extends IRepository<Token> {
  updateOrCreateRefToken(
    user: User,
    refToken: string,
    platForm: PlatFormEnumType,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<Token>;
  deleteManyByUserId(userId: number, tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
