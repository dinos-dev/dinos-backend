import { ProfileMapper } from 'src/user/infrastructure/mapper/profile.mapper';
import { createProfileMock } from '../../__mocks__/user.factory';

describe('ProfileMapper', () => {
  describe('toDomain', () => {
    it('Prisma Profile을 ProfileEntity로 변환한다.', () => {
      // 1. given
      const prismaProfile = createProfileMock();

      // 2. when
      const result = ProfileMapper.toDomain(prismaProfile);

      // 3. then
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe(prismaProfile.id);
      expect(result.userId).toBe(prismaProfile.userId);
      expect(result.nickname).toBe(prismaProfile.nickname);
      expect(result.comment).toBe(prismaProfile.comment);
      expect(result.headerId).toBe(prismaProfile.headerId);
      expect(result.bodyId).toBe(prismaProfile.bodyId);
      expect(result.headerColor).toBe(prismaProfile.headerColor);
      expect(result.bodyColor).toBe(prismaProfile.bodyColor);
      expect(result.createdAt).toBe(prismaProfile.createdAt);
      expect(result.updatedAt).toBe(prismaProfile.updatedAt);
      expect(result.version).toBe(prismaProfile.version);
    });

    it('모든 필드가 올바르게 매핑되는지 확인한다.', () => {
      // 1. given
      const prismaProfile = createProfileMock({
        id: 2,
        userId: 100,
        nickname: 'Test Nickname',
        comment: 'Test Comment',
        headerId: 5,
        bodyId: 10,
        headerColor: '#FF0000',
        bodyColor: '#00FF00',
        version: 2,
      });

      // 2. when
      const result = ProfileMapper.toDomain(prismaProfile);

      // 3. then
      expect(result.id).toBe(2);
      expect(result.userId).toBe(100);
      expect(result.nickname).toBe('Test Nickname');
      expect(result.comment).toBe('Test Comment');
      expect(result.headerId).toBe(5);
      expect(result.bodyId).toBe(10);
      expect(result.headerColor).toBe('#FF0000');
      expect(result.bodyColor).toBe('#00FF00');
      expect(result.version).toBe(2);
    });

    it('null 값을 가진 필드도 올바르게 매핑한다.', () => {
      // 1. given
      const prismaProfile = createProfileMock({
        comment: null,
        headerId: null,
        bodyId: null,
        headerColor: null,
        bodyColor: null,
      });

      // 2. when
      const result = ProfileMapper.toDomain(prismaProfile);

      // 3. then
      expect(result.comment).toBeNull();
      expect(result.headerId).toBeNull();
      expect(result.bodyId).toBeNull();
      expect(result.headerColor).toBeNull();
      expect(result.bodyColor).toBeNull();
    });
  });
});
