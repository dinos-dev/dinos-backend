import { PlatFormEnumType, Token } from '@prisma/client';

export function createMockToken(overrides: Partial<Token> = {}): Token {
  return {
    id: 1,
    userId: 1,
    refToken: 'refToken',
    platForm: PlatFormEnumType.WEB,
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    ...overrides,
  };
}
