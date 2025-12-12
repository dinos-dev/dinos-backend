import { UserMapper } from 'src/user/infrastructure/mapper/user.mapper';
import { createMockUser, createMockUserWithProfile, createMockUserWithTokens } from '../../__mocks__/user.factory';
import { createMockToken } from '../../__mocks__/token.factory';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('Prisma User를 UserEntity로 변환한다.', () => {
      // 1. given
      const prismaUser = createMockUser();

      // 2. when
      const result = UserMapper.toDomain(prismaUser);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(prismaUser.id);
      expect(result.email).toBe(prismaUser.email);
      expect(result.name).toBe(prismaUser.name);
      expect(result.password).toBe(prismaUser.password);
      expect(result.isActive).toBe(prismaUser.isActive);
      expect(result.provider).toBe(prismaUser.provider);
      expect(result.providerId).toBe(prismaUser.providerId);
      expect(result.createdAt).toBe(prismaUser.createdAt);
      expect(result.updatedAt).toBe(prismaUser.updatedAt);
      expect(result.deletedAt).toBe(prismaUser.deletedAt);
      expect(result.version).toBe(prismaUser.version);
    });

    it('tokens가 포함된 Prisma User를 UserEntity로 변환한다.', () => {
      // 1. given
      const prismaUser = createMockUserWithTokens();

      // 2. when
      const result = UserMapper.toDomain(prismaUser);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(prismaUser.id);
      expect(result.email).toBe(prismaUser.email);
    });
  });

  describe('toDomainWithTokens', () => {
    it('Prisma User with Tokens를 UserEntity로 변환한다.', () => {
      // 1. given
      const prismaUser = createMockUserWithTokens();

      // 2. when
      const result = UserMapper.toDomainWithTokens(prismaUser);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(prismaUser.id);
      expect(result.email).toBe(prismaUser.email);
      expect(result.name).toBe(prismaUser.name);
      expect(result.password).toBe(prismaUser.password);
      expect(result.isActive).toBe(prismaUser.isActive);
      expect(result.provider).toBe(prismaUser.provider);
      expect(result.providerId).toBe(prismaUser.providerId);
    });

    it('tokens가 없는 Prisma User를 UserEntity로 변환한다.', () => {
      // 1. given
      const prismaUser = createMockUser();

      // 2. when
      const result = UserMapper.toDomainWithTokens(prismaUser);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(prismaUser.id);
      expect(result.email).toBe(prismaUser.email);
    });
  });

  describe('extractTokens', () => {
    it('Prisma User의 tokens를 TokenEntity 배열로 추출한다.', () => {
      // 1. given
      const mockToken = createMockToken();
      const prismaUser = createMockUserWithTokens({
        tokens: [mockToken],
      });

      // 2. when
      const result = UserMapper.extractTokens(prismaUser);

      // 3. then
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Object);
      expect(result[0].id).toBe(mockToken.id);
      expect(result[0].userId).toBe(mockToken.userId);
      expect(result[0].refToken).toBe(mockToken.refToken);
      expect(result[0].expiresAt).toBe(mockToken.expiresAt);
      expect(result[0].platform).toBe(mockToken.platform);
    });

    it('여러 개의 tokens를 TokenEntity 배열로 추출한다.', () => {
      // 1. given
      const mockToken1 = createMockToken({ id: 1, refToken: 'token1' });
      const mockToken2 = createMockToken({ id: 2, refToken: 'token2' });
      const prismaUser = createMockUserWithTokens({
        tokens: [mockToken1, mockToken2],
      });

      // 2. when
      const result = UserMapper.extractTokens(prismaUser);

      // 3. then
      expect(result).toHaveLength(2);
      expect(result[0].refToken).toBe('token1');
      expect(result[1].refToken).toBe('token2');
    });

    it('tokens가 없으면 빈 배열을 반환한다.', () => {
      // 1. given
      const prismaUser = createMockUser();

      // 2. when
      const result = UserMapper.extractTokens(prismaUser);

      // 3. then
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('tokens가 undefined이면 빈 배열을 반환한다.', () => {
      // 1. given
      const prismaUser = createMockUser();
      const userWithoutTokens = { ...prismaUser, tokens: undefined };

      // 2. when
      const result = UserMapper.extractTokens(userWithoutTokens);

      // 3. then
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('toDomainWithProfile', () => {
    it('Prisma User with Profile을 UserEntity로 변환한다.', () => {
      // 1. given
      const prismaUser = createMockUserWithProfile();

      // 2. when
      const result = UserMapper.toDomainWithProfile(prismaUser);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(prismaUser.id);
      expect(result.email).toBe(prismaUser.email);
      expect(result.name).toBe(prismaUser.name);
      expect(result.profile).toBeDefined();
      expect(result.profile?.id).toBe(prismaUser.profile.id);
      expect(result.profile?.userId).toBe(prismaUser.profile.userId);
      expect(result.profile?.nickname).toBe(prismaUser.profile.nickname);
    });

    it('profile이 없는 Prisma User를 UserEntity로 변환한다.', () => {
      // 1. given
      const prismaUser = createMockUser();
      const userWithoutProfile = { ...prismaUser, profile: undefined };

      // 2. when
      const result = UserMapper.toDomainWithProfile(userWithoutProfile);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(prismaUser.id);
      expect(result.profile).toBeNull();
    });
  });

  describe('extractProfile', () => {
    it('Prisma User의 profile을 ProfileEntity로 추출한다.', () => {
      // 1. given
      const prismaUser = createMockUserWithProfile();

      // 2. when
      const result = UserMapper.extractProfile(prismaUser);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result?.id).toBe(prismaUser.profile.id);
      expect(result?.userId).toBe(prismaUser.profile.userId);
      expect(result?.nickname).toBe(prismaUser.profile.nickname);
      expect(result?.comment).toBe(prismaUser.profile.comment);
      expect(result?.headerId).toBe(prismaUser.profile.headerId);
      expect(result?.bodyId).toBe(prismaUser.profile.bodyId);
      expect(result?.headerColor).toBe(prismaUser.profile.headerColor);
      expect(result?.bodyColor).toBe(prismaUser.profile.bodyColor);
      expect(result?.createdAt).toBe(prismaUser.profile.createdAt);
      expect(result?.updatedAt).toBe(prismaUser.profile.updatedAt);
      expect(result?.version).toBe(prismaUser.profile.version);
    });

    it('profile이 없으면 null을 반환한다.', () => {
      // 1. given
      const prismaUser = createMockUser();
      const userWithoutProfile = { ...prismaUser, profile: undefined };

      // 2. when
      const result = UserMapper.extractProfile(userWithoutProfile);

      // 3. then
      expect(result).toBeNull();
    });
  });
});
