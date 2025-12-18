import { PlatformEnumType, Profile, Provider, Token, User } from '@prisma/client';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { Provider as DomainProvider } from 'src/user/domain/const/provider.enum';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { PlatformEnumType as DomainPlatformEnumType } from 'src/auth/domain/constant/platform.const';
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
 * create Mocking Factory For Token
 */
export function createMockToken(overrides: Partial<Token> = {}): Token {
  return {
    id: 1,
    refToken: 'mock-refresh-token',
    userId: 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
    platform: PlatformEnumType.WEB,
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
    tokens: [createMockToken()],
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
    profile: createProfileMock(),
    ...overrides,
  };
}

export function createMockUserEntity(
  overrides: Partial<{
    id: number | null;
    email: string;
    name: string | null;
    password: string | null;
    isActive: boolean;
    provider: DomainProvider;
    providerId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
    version: number | null;
    profile?: ProfileEntity;
  }> = {},
): UserEntity {
  const defaults = {
    id: 1,
    email: 'exist@test.com',
    name: 'Mock User',
    password: 'password',
    isActive: true,
    provider: DomainProvider.GOOGLE,
    providerId: 'google-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    version: 1,
  };

  const merged = { ...defaults, ...overrides };

  return new UserEntity(
    merged.id,
    merged.email,
    merged.name,
    merged.password,
    merged.isActive,
    merged.provider,
    merged.providerId,
    merged.createdAt,
    merged.updatedAt,
    merged.deletedAt,
    merged.version,
    merged.profile,
  );
}

export function createMockProfileEntity(
  overrides: Partial<{
    id: number | null;
    userId: number;
    nickname: string;
    comment: string | null;
    headerId: number | null;
    bodyId: number | null;
    headerColor: string | null;
    bodyColor: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    version: number | null;
  }> = {},
): ProfileEntity {
  const defaults = {
    id: 1,
    userId: 1,
    nickname: 'Mock User',
    comment: 'Mock Comment',
    headerId: 1,
    bodyId: 1,
    headerColor: '#123456',
    bodyColor: '#654321',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  const merged = { ...defaults, ...overrides };

  return new ProfileEntity(
    merged.id,
    merged.userId,
    merged.nickname,
    merged.comment,
    merged.headerId,
    merged.bodyId,
    merged.headerColor,
    merged.bodyColor,
    merged.createdAt,
    merged.updatedAt,
    merged.version,
  );
}

/**
 * TokenEntity Mocking Factory
 */
export function createMockTokenEntity(
  overrides: Partial<{
    id: number | null;
    userId: number;
    refToken: string;
    expiresAt: Date;
    platform: DomainPlatformEnumType;
    createdAt: Date | null;
    updatedAt: Date | null;
    version: number | null;
  }> = {},
): TokenEntity {
  const defaults = {
    id: 1,
    userId: 1,
    refToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    platform: DomainPlatformEnumType.WEB,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };

  const merged = { ...defaults, ...overrides };

  return new TokenEntity(
    merged.id,
    merged.userId,
    merged.refToken,
    merged.expiresAt,
    merged.platform,
    merged.createdAt,
    merged.updatedAt,
    merged.version,
  );
}

/**
 * UserEntity with ProfileEntity Mocking Factory
 */
export function createMockUserEntityWithProfile(overrides?: {
  user?: Partial<Parameters<typeof createMockUserEntity>[0]>;
  profile?: Partial<Parameters<typeof createMockProfileEntity>[0]>;
}): UserEntity {
  const profileEntity = createMockProfileEntity(overrides?.profile);
  const userEntity = createMockUserEntity({
    ...overrides?.user,
    profile: profileEntity,
  });

  return userEntity;
}

/**
 * UserEntity with TokenEntities Mocking Factory
 */
export function createMockUserEntityWithTokens(overrides?: {
  user?: Partial<Parameters<typeof createMockUserEntity>[0]>;
  tokens?: Partial<Parameters<typeof createMockTokenEntity>[0]>[];
}): UserEntity & { tokens: TokenEntity[] } {
  const userEntity = createMockUserEntity(overrides?.user);
  const tokens = overrides?.tokens
    ? overrides.tokens.map((token) => createMockTokenEntity(token))
    : [createMockTokenEntity()];

  return {
    ...userEntity,
    tokens,
    softDelete: () => {
      userEntity.softDelete();
    },
  };
}
