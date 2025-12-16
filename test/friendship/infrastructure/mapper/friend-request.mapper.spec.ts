import { FriendRequestMapper } from 'src/friendship/infrastructure/mapper/friend-request.mapper';
import { createMockFriendshipRequest } from '../../../__mocks__/friendship.factory';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';
import { FriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';
import { createMockUserEntityWithProfile } from '../../../__mocks__/user.factory';

describe('FriendRequestMapper', () => {
  describe('toDomain', () => {
    it('Prisma FriendRequest를 FriendRequestEntity로 변환한다.', () => {
      // 1. given
      const prismaFriendRequest = createMockFriendshipRequest();

      // 2. when
      const result = FriendRequestMapper.toDomain(prismaFriendRequest);

      // 3. then
      expect(result).toBeInstanceOf(FriendRequestEntity);
      expect(result.id).toBe(prismaFriendRequest.id);
      expect(result.senderId).toBe(prismaFriendRequest.senderId);
      expect(result.receiverId).toBe(prismaFriendRequest.receiverId);
      expect(result.status).toBe(prismaFriendRequest.status);
      expect(result.respondedAt).toEqual(new Date(prismaFriendRequest.respondedAt));
      expect(result.expiresAt).toEqual(new Date(prismaFriendRequest.expiresAt));
      expect(result.createdAt).toBe(prismaFriendRequest.createdAt);
      expect(result.updatedAt).toBe(prismaFriendRequest.updatedAt);
      expect(result.version).toBe(prismaFriendRequest.version);
      expect(result.sender).toBeUndefined();
      expect(result.receiver).toBeUndefined();
    });

    it('모든 필드가 올바르게 매핑되는지 확인한다.', () => {
      // 1. given
      const respondedAt = new Date('2025-01-15');
      const expiresAt = new Date('2025-02-01');
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');

      const prismaFriendRequest = createMockFriendshipRequest({
        id: 100,
        senderId: 10,
        receiverId: 20,
        status: 'ACCEPTED',
        respondedAt,
        expiresAt,
        createdAt,
        updatedAt,
        version: 5,
      });

      // 2. when
      const result = FriendRequestMapper.toDomain(prismaFriendRequest);

      // 3. then
      expect(result.id).toBe(100);
      expect(result.senderId).toBe(10);
      expect(result.receiverId).toBe(20);
      expect(result.status).toBe(FriendRequestStatus.ACCEPTED);
      expect(result.respondedAt).toEqual(respondedAt);
      expect(result.expiresAt).toEqual(expiresAt);
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
      expect(result.version).toBe(5);
    });

    it('다양한 status를 올바르게 변환한다.', () => {
      // 1. given
      const statuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

      statuses.forEach((status) => {
        const prismaFriendRequest = createMockFriendshipRequest({
          status: status as any,
        });

        // 2. when
        const result = FriendRequestMapper.toDomain(prismaFriendRequest);

        // 3. then
        expect(result.status).toBe(status);
      });
    });

    it('respondedAt이 null인 경우 undefined로 변환한다.', () => {
      // 1. given
      const prismaFriendRequest = createMockFriendshipRequest({
        respondedAt: null,
      });

      // 2. when
      const result = FriendRequestMapper.toDomain(prismaFriendRequest);

      // 3. then
      expect(result.respondedAt).toBeUndefined();
    });

    it('expiresAt이 null인 경우 undefined로 변환한다.', () => {
      // 1. given
      const prismaFriendRequest = createMockFriendshipRequest({
        expiresAt: null,
      });

      // 2. when
      const result = FriendRequestMapper.toDomain(prismaFriendRequest);

      // 3. then
      expect(result.expiresAt).toBeUndefined();
    });

    it('respondedAt과 expiresAt이 모두 null인 경우 undefined로 변환한다.', () => {
      // 1. given
      const prismaFriendRequest = createMockFriendshipRequest({
        respondedAt: null,
        expiresAt: null,
      });

      // 2. when
      const result = FriendRequestMapper.toDomain(prismaFriendRequest);

      // 3. then
      expect(result.respondedAt).toBeUndefined();
      expect(result.expiresAt).toBeUndefined();
    });
  });

  describe('toDomainWithSenderProfile', () => {
    it('Prisma FriendRequest with Sender를 FriendRequestEntity로 변환한다.', () => {
      // 1. given
      const senderUserEntity = createMockUserEntityWithProfile({
        user: {
          id: 1,
          email: 'sender@test.com',
          name: 'Sender User',
        },
        profile: {
          id: 1,
          userId: 1,
          nickname: 'Sender Nickname',
          comment: 'Sender Comment',
        },
      });

      const prismaFriendRequest = {
        ...createMockFriendshipRequest({
          id: 1,
          senderId: 1,
          receiverId: 2,
        }),
        sender: senderUserEntity,
      };

      // 2. when
      const result = FriendRequestMapper.toDomainWithSenderProfile(prismaFriendRequest);

      // 3. then
      expect(result).toBeInstanceOf(FriendRequestEntity);
      expect(result.id).toBe(1);
      expect(result.senderId).toBe(1);
      expect(result.receiverId).toBe(2);
      expect(result.sender).toBeDefined();
      expect(result.sender?.id).toBe(1);
      expect(result.sender?.email).toBe('sender@test.com');
      expect(result.sender?.name).toBe('Sender User');
      expect(result.sender?.profile).toBeDefined();
      expect(result.sender?.profile?.nickname).toBe('Sender Nickname');
      expect(result.sender?.profile?.comment).toBe('Sender Comment');
      expect(result.receiver).toBeUndefined();
    });

    it('모든 필드가 올바르게 매핑되는지 확인한다.', () => {
      // 1. given
      const respondedAt = new Date('2025-01-15');
      const expiresAt = new Date('2025-02-01');
      const createdAt = new Date('2025-01-01');
      const updatedAt = new Date('2025-01-02');

      const senderUserEntity = createMockUserEntityWithProfile({
        user: {
          id: 10,
          email: 'sender@test.com',
          name: 'Sender User',
        },
        profile: {
          id: 10,
          userId: 10,
          nickname: 'Sender Nickname',
          comment: 'Sender Comment',
          headerId: 5,
          bodyId: 10,
          headerColor: '#FF0000',
          bodyColor: '#00FF00',
        },
      });

      const prismaFriendRequest = {
        ...createMockFriendshipRequest({
          id: 100,
          senderId: 10,
          receiverId: 20,
          status: 'ACCEPTED',
          respondedAt,
          expiresAt,
          createdAt,
          updatedAt,
          version: 5,
        }),
        sender: senderUserEntity,
      };

      // 2. when
      const result = FriendRequestMapper.toDomainWithSenderProfile(prismaFriendRequest);

      // 3. then
      expect(result.id).toBe(100);
      expect(result.senderId).toBe(10);
      expect(result.receiverId).toBe(20);
      expect(result.status).toBe(FriendRequestStatus.ACCEPTED);
      expect(result.respondedAt).toEqual(respondedAt);
      expect(result.expiresAt).toEqual(expiresAt);
      expect(result.createdAt).toEqual(createdAt);
      expect(result.updatedAt).toEqual(updatedAt);
      expect(result.version).toBe(5);
      expect(result.sender?.id).toBe(10);
      expect(result.sender?.email).toBe('sender@test.com');
      expect(result.sender?.profile?.nickname).toBe('Sender Nickname');
      expect(result.sender?.profile?.headerId).toBe(5);
      expect(result.sender?.profile?.bodyId).toBe(10);
      expect(result.sender?.profile?.headerColor).toBe('#FF0000');
      expect(result.sender?.profile?.bodyColor).toBe('#00FF00');
    });

    it('respondedAt과 expiresAt이 null인 경우 undefined로 변환한다.', () => {
      // 1. given
      const senderUserEntity = createMockUserEntityWithProfile({
        user: {
          id: 1,
          email: 'sender@test.com',
          name: 'Sender User',
        },
      });

      const prismaFriendRequest = {
        ...createMockFriendshipRequest({
          respondedAt: null,
          expiresAt: null,
        }),
        sender: senderUserEntity,
      };

      // 2. when
      const result = FriendRequestMapper.toDomainWithSenderProfile(prismaFriendRequest);

      // 3. then
      expect(result.respondedAt).toBeUndefined();
      expect(result.expiresAt).toBeUndefined();
    });

    it('sender의 profile이 있는 경우 올바르게 매핑한다.', () => {
      // 1. given
      const senderUserEntity = createMockUserEntityWithProfile({
        user: {
          id: 1,
          email: 'sender@test.com',
          name: 'Sender User',
        },
        profile: {
          id: 1,
          userId: 1,
          nickname: 'Test Nickname',
          comment: 'Test Comment',
          headerId: 3,
          bodyId: 7,
          headerColor: '#AABBCC',
          bodyColor: '#DDEEFF',
        },
      });

      const prismaFriendRequest = {
        ...createMockFriendshipRequest(),
        sender: senderUserEntity,
      };

      // 2. when
      const result = FriendRequestMapper.toDomainWithSenderProfile(prismaFriendRequest);

      // 3. then
      expect(result.sender?.profile).toBeDefined();
      expect(result.sender?.profile?.id).toBe(1);
      expect(result.sender?.profile?.userId).toBe(1);
      expect(result.sender?.profile?.nickname).toBe('Test Nickname');
      expect(result.sender?.profile?.comment).toBe('Test Comment');
      expect(result.sender?.profile?.headerId).toBe(3);
      expect(result.sender?.profile?.bodyId).toBe(7);
      expect(result.sender?.profile?.headerColor).toBe('#AABBCC');
      expect(result.sender?.profile?.bodyColor).toBe('#DDEEFF');
    });
  });
});
