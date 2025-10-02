import { PlatformEnumType, Profile, Provider, Token, User } from '@prisma/client';

/**
 * User Mocking Factory
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'exist@test.com',
    name: 'Mock User',
    password: 'password',
    isActive: true,
    provider: Provider.GOOGLE,
    providerId: 'google-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
    ...overrides,
  };
}

/**
 * Profile Mocking Factory
 * */
export function createProfileMock(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 1,
    userId: 1,
    nickname: 'Mock User',
    comment: 'Mock Comment',
    headerId: 1,
    bodyId: 1,
    headerColor: '#123456',
    bodyColor: '#123456',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    ...overrides,
  };
}

/**
 * User Mocking Factory with Tokens
 */
export function createMockUserWithTokens(
  overrides: Partial<User & { tokens: Token[] }> = {},
): User & { tokens: Token[] } {
  return {
    ...createMockUser(),
    tokens: [
      {
        id: 1,
        refToken: 'token1',
        userId: 1,
        expiresAt: new Date(),
        platform: PlatformEnumType.WEB,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      },
    ],
    ...overrides,
  };
}

/**
 * User Mocking Factory with Profile
 */
export function createMockUserWithProfile(
  overrides: Partial<User & { profile: Profile }> = {},
): User & { profile: Profile } {
  return {
    ...createMockUser(),
    profile: {
      id: 1,
      userId: 1,
      nickname: 'Mock User',
      comment: 'Mock Comment',
      headerId: 1,
      bodyId: 1,
      headerColor: 'red',
      bodyColor: 'blue',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
    ...overrides,
  };
}
