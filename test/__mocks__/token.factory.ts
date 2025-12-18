import { PlatformEnumType, Token } from '@prisma/client';

export function createMockToken(overrides: Partial<Token> = {}): Token {
  return {
    id: 1,
    userId: 1,
    refToken: 'refToken',
    platform: PlatformEnumType.WEB,
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    ...overrides,
  };
}
