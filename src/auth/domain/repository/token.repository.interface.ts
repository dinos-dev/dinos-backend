import { PlatFormEnumType, Prisma, Token, User } from '@prisma/client';

export interface ITokenRepository {
  updateOrCreateRefToken(
    user: User,
    refToken: string,
    platForm: PlatFormEnumType,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<Token>;
  deleteManyByUserId(userId: number, tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
