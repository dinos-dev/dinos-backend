import { ActivityType } from 'src/friendship/domain/const/activity.enum';
import { FriendshipActivityEntity } from 'src/friendship/domain/entities/friendship-activity.entity';

describe('FriendshipActivityEntity', () => {
  describe('create', () => {
    it('올바른 파라미터로 friendshipActivityEntity를 생성한다', () => {
      // 1. given
      const params = {
        friendshipId: 1,
        activityType: ActivityType.MEAL_TOGETHER,
        activityDate: new Date(),
        location: '서울 강남구 역삼동',
      };
      // 2. when
      const friendshipActivity = FriendshipActivityEntity.create(params);

      // 3. then
      expect(friendshipActivity.friendshipId).toBe(params.friendshipId);
      expect(friendshipActivity.activityType).toBe(params.activityType);
      expect(friendshipActivity.activityDate).toBe(params.activityDate);
      expect(friendshipActivity.location).toBe(params.location);
      expect(friendshipActivity.id).toBeNull();
    });
  });
});
