import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';

describe('FriendshipEntity', () => {
  describe('create', () => {
    it('올바른 파라미터로 FriendshipEntity를 생성한다.', () => {
      // 1. given
      const params = {
        requesterId: 1,
        addresseeId: 2,
      };
      // 2. when
      const friendship = FriendshipEntity.create(params);

      // 3. then
      expect(friendship.requesterId).toBe(params.requesterId);
      expect(friendship.addresseeId).toBe(params.addresseeId);
      expect(friendship.id).toBeNull();
    });
  });
});
