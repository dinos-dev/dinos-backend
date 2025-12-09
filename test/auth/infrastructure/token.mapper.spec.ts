import { TokenMapper } from 'src/auth/infrastructure/mapper/token.mapper';
import { Token as PrismaToken } from '@prisma/client';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { PlatformEnumType } from 'src/auth/domain/constant/platform.const';
import { createMockToken } from '../../__mocks__/token.factory';

describe('TokenMapper', () => {
  describe('toDomain', () => {
    it('Prisma Token Object를 도메인 계층의 TokenEntity로 변환한다', () => {
      // 1. given
      const prismaToken: PrismaToken = createMockToken({
        id: 1,
        userId: 1,
        refToken: 'test-refresh-token',
        platform: PlatformEnumType.WEB,
        expiresAt: new Date('2025-12-31'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        version: 1,
      });

      // 2. when
      const result = TokenMapper.toDomain(prismaToken);

      // 3. then
      expect(result).toBeInstanceOf(TokenEntity);
      expect(result.id).toBe(1);
      expect(result.userId).toBe(1);
      expect(result.refToken).toBe('test-refresh-token');
      expect(result.platform).toBe(PlatformEnumType.WEB);
      expect(result.expiresAt).toEqual(new Date('2025-12-31'));
      expect(result.createdAt).toEqual(new Date('2025-01-01'));
      expect(result.updatedAt).toEqual(new Date('2025-01-02'));
      expect(result.version).toBe(1);
    });

    it('모든 필드가 올바르게 매핑되는지 확인한다', () => {
      // 1. given
      const prismaToken = createMockToken();

      // 2. when
      const result = TokenMapper.toDomain(prismaToken);

      // 3. then
      expect(result).toBeInstanceOf(TokenEntity);
      expect(result.id).toBe(prismaToken.id);
      expect(result.userId).toBe(prismaToken.userId);
      expect(result.refToken).toBe(prismaToken.refToken);
      expect(result.platform).toBe(prismaToken.platform);
      expect(result.expiresAt).toEqual(prismaToken.expiresAt);
      expect(result.createdAt).toEqual(prismaToken.createdAt);
      expect(result.updatedAt).toEqual(prismaToken.updatedAt);
      expect(result.version).toBe(prismaToken.version);
    });

    it('다양한 Platform 타입을 올바르게 변환한다', () => {
      // 1. given
      const platforms = [
        PlatformEnumType.WEB,
        PlatformEnumType.ANDROID,
        PlatformEnumType.IOS,
        PlatformEnumType.UNKNOWN,
      ];

      platforms.forEach((platform) => {
        const prismaToken = createMockToken({ platform });

        // 2. when
        const result = TokenMapper.toDomain(prismaToken);

        // 3. then
        expect(result.platform).toBe(platform);
      });
    });
  });
});
