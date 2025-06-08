import { PlatFormEnumType, Token, User } from '@prisma/client';

export interface ITokenRepository {
  updateOrCreateRefToken(user: User, refToken: string, platForm: PlatFormEnumType, expiresAt: Date): Promise<Token>;
}
