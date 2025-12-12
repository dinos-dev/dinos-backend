import { Provider } from 'src/user/domain/const/provider.enum';
import { UserEntity } from 'src/user/domain/entities/user.entity';

describe('UserEntity', () => {
  describe('create', () => {
    it('올바른 파라미터로 UserEntity를 생성한다', () => {
      // 1.given
      const params = {
        email: 'test@test.com',
        name: 'testUser',
        provider: Provider.LOCAL,
      };

      // 2. when
      const user = UserEntity.create(params);

      // 3. then
      expect(user.email).toBe(params.email);
      expect(user.name).toBe(params.name);
      expect(user.provider).toBe(params.provider);
      expect(user.id).toBeNull();
    });
  });

  describe('softDelete', () => {
    it('UserEntity를 softDelete 한다, softDelete 시점을 기준으로 deletedAt 필드가 채워진다', () => {
      // 1. given
      const user = UserEntity.create({
        email: 'test@test.com',
        name: 'testUser',
        provider: Provider.LOCAL,
      });
      const beforeDelete = new Date();

      // 2. when
      user.softDelete();

      // 3. then
      expect(user.deletedAt).not.toBeNull();
      expect(user.deletedAt).toBeInstanceOf(Date);
      expect(user.deletedAt!.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime());
    });
  });
});
