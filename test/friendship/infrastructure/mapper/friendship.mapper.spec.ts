import { FriendshipMapper } from 'src/friendship/infrastructure/mapper/friendship.mapper';
import { createMockFriendship } from '../../../__mocks__/friendship.factory';
import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';
import { createMockUser, createMockUserWithProfile } from '../../../__mocks__/user.factory';
import { FriendWithActivityDto } from 'src/friendship/application/dto/friend-with-activity.dto';

describe('FriendshipMapper', () => {
  describe('toDomain', () => {
    it('Prisma Friendship을 FriendshipEntity로 변환한다.', () => {
      // 1. given
      const prismaFriendship = createMockFriendship();

      // 2. when
      const result = FriendshipMapper.toDomain(prismaFriendship);

      // 3. then
      expect(result).toBeInstanceOf(FriendshipEntity);
      expect(result.id).toBe(prismaFriendship.id);
      expect(result.requesterId).toBe(prismaFriendship.requesterId);
      expect(result.addresseeId).toBe(prismaFriendship.addresseeId);
      expect(result.createdAt).toBe(prismaFriendship.createdAt);
      expect(result.updatedAt).toBe(prismaFriendship.updatedAt);
      expect(result.version).toBe(prismaFriendship.version);
    });

    it('모든 필드가 올바르게 매핑되는지 확인한다.', () => {
      // 1. given
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');
      const prismaFriendship = createMockFriendship({
        id: 100,
        requesterId: 10,
        addresseeId: 20,
        createdAt,
        updatedAt,
        version: 5,
      });

      // 2. when
      const result = FriendshipMapper.toDomain(prismaFriendship);

      // 3. then
      expect(result.id).toBe(100);
      expect(result.requesterId).toBe(10);
      expect(result.addresseeId).toBe(20);
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
      expect(result.version).toBe(5);
    });
  });

  describe('toFriendDtos', () => {
    it('현재 사용자가 requester인 경우 addressee를 friend로 매핑한다.', () => {
      // 1. given
      const currentUserId = 1;
      const addresseeUser = createMockUserWithProfile({
        id: 2,
        email: 'friend@test.com',
        name: 'Friend User',
        profile: {
          id: 2,
          userId: 2,
          nickname: 'Friend Nickname',
          comment: 'Friend Comment',
          headerId: 10,
          bodyId: 20,
          headerColor: '#FF0000',
          bodyColor: '#00FF00',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      });

      const requesterUser = createMockUserWithProfile({
        id: currentUserId,
        email: 'current@test.com',
        name: 'Current User',
      });

      const friendshipWithRelations = {
        ...createMockFriendship({
          id: 1,
          requesterId: currentUserId,
          addresseeId: 2,
        }),
        _count: { activities: 5 },
        requester: requesterUser,
        addressee: addresseeUser,
      };

      // 2. when
      const result = FriendshipMapper.toFriendDtos([friendshipWithRelations], currentUserId);

      // 3. then
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(FriendWithActivityDto);
      expect(result[0].id).toBe(1);
      expect(result[0].friendUserId).toBe(2);
      expect(result[0].email).toBe('friend@test.com');
      expect(result[0].name).toBe('Friend User');
      expect(result[0].activityCount).toBe(5);
      expect(result[0].friendProfile).not.toBeNull();
      expect(result[0].friendProfile?.nickname).toBe('Friend Nickname');
      expect(result[0].friendProfile?.comment).toBe('Friend Comment');
      expect(result[0].friendProfile?.headerId).toBe(10);
      expect(result[0].friendProfile?.bodyId).toBe(20);
      expect(result[0].friendProfile?.headerColor).toBe('#FF0000');
      expect(result[0].friendProfile?.bodyColor).toBe('#00FF00');
    });

    it('현재 사용자가 addressee인 경우 requester를 friend로 매핑한다.', () => {
      // 1. given
      const currentUserId = 2;
      const requesterUser = createMockUserWithProfile({
        id: 1,
        email: 'friend@test.com',
        name: 'Friend User',
        profile: {
          id: 1,
          userId: 1,
          nickname: 'Friend Nickname',
          comment: 'Friend Comment',
          headerId: 15,
          bodyId: 25,
          headerColor: '#0000FF',
          bodyColor: '#FFFF00',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        },
      });

      const addresseeUser = createMockUserWithProfile({
        id: currentUserId,
        email: 'current@test.com',
        name: 'Current User',
      });

      const friendshipWithRelations = {
        ...createMockFriendship({
          id: 2,
          requesterId: 1,
          addresseeId: currentUserId,
        }),
        _count: { activities: 3 },
        requester: requesterUser,
        addressee: addresseeUser,
      };

      // 2. when
      const result = FriendshipMapper.toFriendDtos([friendshipWithRelations], currentUserId);

      // 3. then
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(FriendWithActivityDto);
      expect(result[0].id).toBe(2);
      expect(result[0].friendUserId).toBe(1);
      expect(result[0].email).toBe('friend@test.com');
      expect(result[0].name).toBe('Friend User');
      expect(result[0].activityCount).toBe(3);
      expect(result[0].friendProfile).not.toBeNull();
      expect(result[0].friendProfile?.nickname).toBe('Friend Nickname');
      expect(result[0].friendProfile?.comment).toBe('Friend Comment');
      expect(result[0].friendProfile?.headerId).toBe(15);
      expect(result[0].friendProfile?.bodyId).toBe(25);
      expect(result[0].friendProfile?.headerColor).toBe('#0000FF');
      expect(result[0].friendProfile?.bodyColor).toBe('#FFFF00');
    });

    it('친구의 profile이 없는 경우 friendProfile은 null이다.', () => {
      // 1. given
      const currentUserId = 1;
      // createMockUser를 사용해서 전체 User 필드를 포함
      const addresseeUser = {
        ...createMockUser({
          id: 2,
          email: 'friend@test.com',
          name: 'Friend User',
        }),
        profile: null, // profile만 null로 설정
      };

      const requesterUser = createMockUserWithProfile({
        id: currentUserId,
        email: 'current@test.com',
        name: 'Current User',
      });

      const friendshipWithRelations = {
        ...createMockFriendship({
          id: 3,
          requesterId: currentUserId,
          addresseeId: 2,
        }),
        _count: { activities: 0 },
        requester: requesterUser,
        addressee: addresseeUser,
      };

      // 2. when
      const result = FriendshipMapper.toFriendDtos([friendshipWithRelations], currentUserId);

      // 3. then
      expect(result).toHaveLength(1);
      expect(result[0].friendProfile).toBeNull();
    });

    it('여러 개의 friendship을 DTO 배열로 변환한다.', () => {
      // 1. given
      const currentUserId = 1;
      const friend1 = createMockUserWithProfile({
        id: 2,
        email: 'friend1@test.com',
        name: 'Friend 1',
      });

      const friend2 = createMockUserWithProfile({
        id: 3,
        email: 'friend2@test.com',
        name: 'Friend 2',
      });

      const requesterUser = createMockUserWithProfile({
        id: currentUserId,
        email: 'current@test.com',
        name: 'Current User',
      });

      const friendships = [
        {
          ...createMockFriendship({
            id: 1,
            requesterId: currentUserId,
            addresseeId: 2,
          }),
          _count: { activities: 5 },
          requester: requesterUser,
          addressee: friend1,
        },
        {
          ...createMockFriendship({
            id: 2,
            requesterId: currentUserId,
            addresseeId: 3,
          }),
          _count: { activities: 3 },
          requester: requesterUser,
          addressee: friend2,
        },
      ];

      // 2. when
      const result = FriendshipMapper.toFriendDtos(friendships, currentUserId);

      // 3. then
      expect(result).toHaveLength(2);
      expect(result[0].friendUserId).toBe(2);
      expect(result[0].email).toBe('friend1@test.com');
      expect(result[0].activityCount).toBe(5);
      expect(result[1].friendUserId).toBe(3);
      expect(result[1].email).toBe('friend2@test.com');
      expect(result[1].activityCount).toBe(3);
    });

    it('빈 배열을 전달하면 빈 배열을 반환한다.', () => {
      // 1. given
      const currentUserId = 1;
      const friendships = [];

      // 2. when
      const result = FriendshipMapper.toFriendDtos(friendships, currentUserId);

      // 3. then
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('activityCount가 0인 경우에도 올바르게 매핑한다.', () => {
      // 1. given
      const currentUserId = 1;
      const addresseeUser = createMockUserWithProfile({
        id: 2,
        email: 'friend@test.com',
        name: 'Friend User',
      });

      const requesterUser = createMockUserWithProfile({
        id: currentUserId,
        email: 'current@test.com',
        name: 'Current User',
      });

      const friendshipWithRelations = {
        ...createMockFriendship({
          id: 1,
          requesterId: currentUserId,
          addresseeId: 2,
        }),
        _count: { activities: 0 },
        requester: requesterUser,
        addressee: addresseeUser,
      };

      // 2. when
      const result = FriendshipMapper.toFriendDtos([friendshipWithRelations], currentUserId);

      // 3. then
      expect(result).toHaveLength(1);
      expect(result[0].activityCount).toBe(0);
    });
  });
});
