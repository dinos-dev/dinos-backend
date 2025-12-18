import { PlatformEnumType } from 'src/auth/domain/constant/platform.const';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';

describe('TokenEntity', () => {
  describe('create', () => {
    it('올바른 파라미터로 TokenEntity를 생성한다', () => {
      // 1) Given
      const params = {
        userId: 1,
        refToken: 'refresh.token',
        expiresAt: new Date('2025-12-31'),
        platform: PlatformEnumType.ANDROID,
      };

      // 2) When
      const token = TokenEntity.create(params);

      // Then
      expect(token.userId).toBe(1);
      expect(token.refToken).toBe('refresh.token');
      expect(token.platform).toBe(PlatformEnumType.ANDROID);
      expect(token.id).toBeNull();
    });
  });
});
