import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';

import { FriendshipService } from 'src/friendship/application/friendship.service';
import { IFriendshipRepository } from 'src/friendship/domain/repository/friendship.repository.interface';
import { IFriendshipActivityRepository } from 'src/friendship/domain/repository/friendship-activity.repository.interface';
import { IFriendRequestRepository } from 'src/friendship/domain/repository/friend-request.repository.interface';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { IFriendshipQuery } from 'src/friendship/application/interface/friendship-query.interface';

import { RequestFriendshipCommand } from 'src/friendship/application/command/request-friendship.command';
import { FriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';
import { HttpFriendshipErrorConstants } from 'src/friendship/application/helper/http-error-object';

import { createMockFriendshipEntity, createMockFriendshipRequestEntity } from '../../__mocks__/friendship.factory';
import { createMockUserEntity } from '../../__mocks__/user.factory';

jest.mock('@nestjs-cls/transactional', () => ({
  ...jest.requireActual('@nestjs-cls/transactional'),
  Transactional: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  },
}));

describe('FriendshipService', () => {
  let service: FriendshipService;
  let userRepository: jest.Mocked<IUserRepository>;
  let friendshipRepository: jest.Mocked<IFriendshipRepository>;
  let friendshipActivityRepository: jest.Mocked<IFriendshipActivityRepository>;
  let friendRequestRepository: jest.Mocked<IFriendRequestRepository>;
  let friendshipQuery: jest.Mocked<IFriendshipQuery>;

  beforeEach(() => {
    // Create mocks
    userRepository = mockDeep<IUserRepository>();
    friendshipRepository = mockDeep<IFriendshipRepository>();
    friendshipActivityRepository = mockDeep<IFriendshipActivityRepository>();
    friendRequestRepository = mockDeep<IFriendRequestRepository>();
    friendshipQuery = mockDeep<IFriendshipQuery>();

    // Directly instantiate FriendshipService without TestingModule
    service = new FriendshipService(
      userRepository,
      friendshipRepository,
      friendshipActivityRepository,
      friendRequestRepository,
      friendshipQuery,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestFriendship', () => {
    const mockCommand = new RequestFriendshipCommand(1, 2);

    it('친구 요청을 성공적으로 생성한다.', async () => {
      // given
      const mockUser = createMockUserEntity({ id: 2 });
      const mockFriendRequest = createMockFriendshipRequestEntity({
        senderId: 1,
        receiverId: 2,
        status: FriendRequestStatus.PENDING,
      });

      userRepository.findByUserId.mockResolvedValue(mockUser);
      friendRequestRepository.upsertRequestFriendInvite.mockResolvedValue(mockFriendRequest);

      // when
      const result = await service.requestFriendship(mockCommand);

      // then
      expect(result).toEqual(mockFriendRequest);
      expect(userRepository.findByUserId).toHaveBeenCalledWith(mockCommand.receiverId);
      expect(friendRequestRepository.upsertRequestFriendInvite).toHaveBeenCalled();
    });

    it('존재하지 않는 사용자에게 친구 요청 시 NotFoundException을 발생시킨다.', async () => {
      // given
      userRepository.findByUserId.mockResolvedValue(null);

      // when & then
      await expect(service.requestFriendship(mockCommand)).rejects.toThrow(NotFoundException);
      await expect(service.requestFriendship(mockCommand)).rejects.toThrow(
        HttpFriendshipErrorConstants.NOT_FOUND_USER.message as string,
      );
      expect(friendRequestRepository.upsertRequestFriendInvite).not.toHaveBeenCalled();
    });
  });

  describe('findByReceiveId', () => {
    it('나에게 요청을 보낸 사용자 정보를 조회한다.', async () => {
      // given
      const mockFriendRequests = [
        createMockFriendshipRequestEntity({ id: 1, senderId: 2, receiverId: 1 }),
        createMockFriendshipRequestEntity({ id: 2, senderId: 3, receiverId: 1 }),
      ];
      friendRequestRepository.findByReceiveId.mockResolvedValue(mockFriendRequests);

      // when
      const result = await service.findByReceiveId(1);

      // then
      expect(result).toEqual(mockFriendRequests);
      expect(friendRequestRepository.findByReceiveId).toHaveBeenCalledWith(1);
    });

    it('나에게 요청을 보낸 사용자가 없으면 빈 배열을 반환한다.', async () => {
      // given
      friendRequestRepository.findByReceiveId.mockResolvedValue([]);

      // when
      const result = await service.findByReceiveId(1);

      // then
      expect(result).toEqual([]);
      expect(friendRequestRepository.findByReceiveId).toHaveBeenCalledWith(1);
    });
  });

  describe('respondToFriendRequest', () => {
    const friendRequestId = 1;
    const userId = 2;

    it('친구 요청을 수락하면 친구 관계가 생성된다.', async () => {
      // given
      const mockFriendRequest = createMockFriendshipRequestEntity({
        id: friendRequestId,
        senderId: 1,
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      });
      const mockFriendship = createMockFriendshipEntity({ requesterId: 1, addresseeId: userId });

      friendRequestRepository.findById.mockResolvedValue(mockFriendRequest);
      friendRequestRepository.upsertRequestFriendInvite.mockResolvedValue(mockFriendRequest);
      friendshipRepository.upsertFriendship.mockResolvedValue(mockFriendship);

      // when
      const result = await service.respondToFriendRequest(friendRequestId, FriendRequestStatus.ACCEPTED, userId);

      // then
      expect(result).toBe('친구 요청을 수락하였습니다.');
      expect(friendRequestRepository.findById).toHaveBeenCalledWith(friendRequestId);
      expect(friendRequestRepository.upsertRequestFriendInvite).toHaveBeenCalled();
      expect(friendshipRepository.upsertFriendship).toHaveBeenCalled();
    });

    it('친구 요청을 거절하면 친구 관계가 생성되지 않는다.', async () => {
      // given
      const mockFriendRequest = createMockFriendshipRequestEntity({
        id: friendRequestId,
        senderId: 1,
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      });

      friendRequestRepository.findById.mockResolvedValue(mockFriendRequest);
      friendRequestRepository.upsertRequestFriendInvite.mockResolvedValue(mockFriendRequest);

      // when
      const result = await service.respondToFriendRequest(friendRequestId, FriendRequestStatus.REJECTED, userId);

      // then
      expect(result).toBe('친구 요청을 거절하였습니다.');
      expect(friendRequestRepository.findById).toHaveBeenCalledWith(friendRequestId);
      expect(friendRequestRepository.upsertRequestFriendInvite).toHaveBeenCalled();
      expect(friendshipRepository.upsertFriendship).not.toHaveBeenCalled();
    });

    it('친구 요청을 찾을 수 없으면 NotFoundException을 발생시킨다.', async () => {
      // given
      friendRequestRepository.findById.mockResolvedValue(null);

      // when & then
      await expect(
        service.respondToFriendRequest(friendRequestId, FriendRequestStatus.ACCEPTED, userId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.respondToFriendRequest(friendRequestId, FriendRequestStatus.ACCEPTED, userId),
      ).rejects.toThrow(HttpFriendshipErrorConstants.NOT_FOUND_FRIEND_REQUEST.message);
    });

    it('본인이 받은 친구 요청이 아닌 경우 ForbiddenException을 발생시킨다.', async () => {
      // given
      const mockFriendRequest = createMockFriendshipRequestEntity({
        id: friendRequestId,
        senderId: 1,
        receiverId: 3, // different user
        status: FriendRequestStatus.PENDING,
      });

      friendRequestRepository.findById.mockResolvedValue(mockFriendRequest);

      // when & then
      await expect(
        service.respondToFriendRequest(friendRequestId, FriendRequestStatus.ACCEPTED, userId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.respondToFriendRequest(friendRequestId, FriendRequestStatus.ACCEPTED, userId),
      ).rejects.toThrow(HttpFriendshipErrorConstants.INVALID_FRIEND_REQUEST_RECEIVER.message);
    });
  });

  describe('findAllFriendship', () => {
    it('나의 친구 리스트를 조회한다.', async () => {
      // 1. given
      const userId = 1;
      const paginationOptions = { page: 1, limit: 20 };
      const mockResult = {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      friendshipQuery.findAllFriendship.mockResolvedValue(mockResult);

      // when
      const result = await service.findAllFriendship(userId, paginationOptions);

      // 3. then
      expect(result).toEqual(mockResult);
      expect(friendshipQuery.findAllFriendship).toHaveBeenCalledWith(userId, paginationOptions);
    });

    it('페이지네이션 옵션 없이 친구 리스트를 조회한다.', async () => {
      // given
      const userId = 1;
      const mockResult = {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      friendshipQuery.findAllFriendship.mockResolvedValue(mockResult);

      // when
      const result = await service.findAllFriendship(userId);

      // then
      expect(result).toEqual(mockResult);
      expect(friendshipQuery.findAllFriendship).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe('removeFriendship', () => {
    const friendshipId = 1;
    const userId = 1;

    it('친구 관계를 성공적으로 삭제한다.', async () => {
      // given
      const mockFriendship = createMockFriendshipEntity({
        id: friendshipId,
        requesterId: userId,
        addresseeId: 2,
      });

      friendshipRepository.findById.mockResolvedValue(mockFriendship);
      friendshipRepository.removeById.mockResolvedValue(mockFriendship);
      friendshipActivityRepository.removeByFriendshipId.mockResolvedValue(undefined);
      friendRequestRepository.removeByReceiverAndSenderId.mockResolvedValue(undefined);

      // when
      await service.removeFriendship(friendshipId, userId);

      // then
      expect(friendshipRepository.findById).toHaveBeenCalledWith(friendshipId);
      expect(friendshipRepository.removeById).toHaveBeenCalledWith(friendshipId);
      expect(friendshipActivityRepository.removeByFriendshipId).toHaveBeenCalledWith(friendshipId);
      expect(friendRequestRepository.removeByReceiverAndSenderId).toHaveBeenCalledWith(
        mockFriendship.requesterId,
        mockFriendship.addresseeId,
      );
    });

    it('addressee로 등록된 사용자도 친구 관계를 삭제할 수 있다.', async () => {
      // given
      const mockFriendship = createMockFriendshipEntity({
        id: friendshipId,
        requesterId: 2,
        addresseeId: userId,
      });

      friendshipRepository.findById.mockResolvedValue(mockFriendship);
      friendshipRepository.removeById.mockResolvedValue(mockFriendship);
      friendshipActivityRepository.removeByFriendshipId.mockResolvedValue(undefined);
      friendRequestRepository.removeByReceiverAndSenderId.mockResolvedValue(undefined);

      // when
      await service.removeFriendship(friendshipId, userId);

      // then
      expect(friendshipRepository.findById).toHaveBeenCalledWith(friendshipId);
      expect(friendshipRepository.removeById).toHaveBeenCalledWith(friendshipId);
    });

    it('친구 관계를 찾을 수 없으면 NotFoundException을 발생시킨다.', async () => {
      // given
      friendshipRepository.findById.mockResolvedValue(null);

      // when & then
      await expect(service.removeFriendship(friendshipId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.removeFriendship(friendshipId, userId)).rejects.toThrow(
        HttpFriendshipErrorConstants.NOT_FOUND_FRIENDSHIP.message,
      );
    });

    it('본인의 친구 관계가 아닌 경우 ForbiddenException을 발생시킨다.', async () => {
      // given
      const mockFriendship = createMockFriendshipEntity({
        id: friendshipId,
        requesterId: 2,
        addresseeId: 3, // different users
      });

      friendshipRepository.findById.mockResolvedValue(mockFriendship);

      // when & then
      await expect(service.removeFriendship(friendshipId, userId)).rejects.toThrow(ForbiddenException);
      await expect(service.removeFriendship(friendshipId, userId)).rejects.toThrow(
        HttpFriendshipErrorConstants.FORBIDDEN_FRIENDSHIP_REMOVAL.message,
      );
    });
  });
});
