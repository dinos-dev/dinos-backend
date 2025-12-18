import { InviteCodeMapper } from 'src/user/infrastructure/mapper/invite-code.mapper';
import { InviteCode } from '@prisma/client';
import { createMockUser } from '../../__mocks__/user.factory';
import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';
import { UserMapper } from 'src/user/infrastructure/mapper/user.mapper';

describe('InviteCodeMapper', () => {
  const createMockInviteCode = (overrides: Partial<InviteCode> = {}): InviteCode => {
    return {
      id: 1,
      userId: 1,
      code: 'ABC123DEF45',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  describe('toDomain', () => {
    it('Prisma InviteCode를 InviteCodeEntity로 변환한다.', () => {
      // 1. given
      const prismaInviteCode = createMockInviteCode();

      // 2. when
      const result = InviteCodeMapper.toDomain(prismaInviteCode);

      // 3. then
      expect(result).toBeInstanceOf(InviteCodeEntity);
      expect(result.id).toBe(prismaInviteCode.id);
      expect(result.userId).toBe(prismaInviteCode.userId);
      expect(result.code).toBe(prismaInviteCode.code);
      expect(result.createdAt).toBe(prismaInviteCode.createdAt);
      expect(result.updatedAt).toBe(prismaInviteCode.updatedAt);
    });

    it('모든 필드가 올바르게 매핑되는지 확인한다.', () => {
      // 1. given
      const prismaInviteCode = createMockInviteCode({
        id: 2,
        userId: 100,
        code: 'XYZ789ABC12',
      });

      // 2. when
      const result = InviteCodeMapper.toDomain(prismaInviteCode);

      // 3. then
      expect(result.id).toBe(2);
      expect(result.userId).toBe(100);
      expect(result.code).toBe('XYZ789ABC12');
    });
  });

  describe('toDomainWithUser', () => {
    it('User가 포함된 Prisma InviteCode를 InviteCodeEntity로 변환한다.', () => {
      // 1. given
      const mockUser = createMockUser();
      const prismaInviteCode = createMockInviteCode();
      const inviteCodeWithUser = {
        ...prismaInviteCode,
        user: mockUser,
      };

      // 2. when
      const result = InviteCodeMapper.toDomainWithUser(inviteCodeWithUser);

      // 3. then
      expect(result).toBeInstanceOf(InviteCodeEntity);
      expect(result.id).toBe(prismaInviteCode.id);
      expect(result.userId).toBe(prismaInviteCode.userId);
      expect(result.code).toBe(prismaInviteCode.code);
      expect(result.createdAt).toBe(prismaInviteCode.createdAt);
      expect(result.updatedAt).toBe(prismaInviteCode.updatedAt);
    });

    it('toDomain과 동일한 결과를 반환한다.', () => {
      // 1. given
      const mockUser = createMockUser();
      const prismaInviteCode = createMockInviteCode();
      const inviteCodeWithUser = {
        ...prismaInviteCode,
        user: mockUser,
      };

      // 2. when
      const resultWithUser = InviteCodeMapper.toDomainWithUser(inviteCodeWithUser);
      const resultWithoutUser = InviteCodeMapper.toDomain(prismaInviteCode);

      // 3. then
      expect(resultWithUser.id).toBe(resultWithoutUser.id);
      expect(resultWithUser.userId).toBe(resultWithoutUser.userId);
      expect(resultWithUser.code).toBe(resultWithoutUser.code);
    });
  });

  describe('extractUserAndProfile', () => {
    it('Prisma InviteCode의 user를 UserEntity로 추출한다.', () => {
      // 1. given
      const mockUser = createMockUser();
      const prismaInviteCode = createMockInviteCode();
      const inviteCodeWithUser = {
        ...prismaInviteCode,
        user: mockUser,
      };

      // 2. when
      const result = InviteCodeMapper.extractUserAndProfile(inviteCodeWithUser);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.name).toBe(mockUser.name);
      expect(result.password).toBe(mockUser.password);
      expect(result.isActive).toBe(mockUser.isActive);
      expect(result.provider).toBe(mockUser.provider);
      expect(result.providerId).toBe(mockUser.providerId);
    });

    it('UserMapper.toDomain과 동일한 결과를 반환한다.', () => {
      // 1. given
      const mockUser = createMockUser();
      const prismaInviteCode = createMockInviteCode();
      const inviteCodeWithUser = {
        ...prismaInviteCode,
        user: mockUser,
      };

      // 2. when
      const result = InviteCodeMapper.extractUserAndProfile(inviteCodeWithUser);
      const expectedResult = UserMapper.toDomain(mockUser);

      // 3. then
      expect(result.id).toBe(expectedResult.id);
      expect(result.email).toBe(expectedResult.email);
      expect(result.name).toBe(expectedResult.name);
      expect(result.provider).toBe(expectedResult.provider);
    });
  });
});
