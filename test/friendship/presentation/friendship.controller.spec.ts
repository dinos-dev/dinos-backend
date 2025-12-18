import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { FriendshipController } from 'src/friendship/presentation/friendship.controller';
import { FriendshipService } from 'src/friendship/application/friendship.service';
import { FriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';
import { HttpFriendshipErrorConstants } from 'src/friendship/application/helper/http-error-object';

import { SendFriendRequestDto } from 'src/friendship/presentation/dto/request/send-friend-request.dto';
import { RespondToFriendRequestDto } from 'src/friendship/presentation/dto/request/respond-friend-request.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

import { createMockFriendshipRequestEntity } from '../../__mocks__/friendship.factory';
import { createMockUserEntity } from '../../__mocks__/user.factory';

describe('FriendshipController', () => {
  let controller: FriendshipController;
  let friendshipService: jest.Mocked<FriendshipService>;

  const mockUserId = 1;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendshipController],
      providers: [
        {
          provide: FriendshipService,
          useValue: {
            requestFriendship: jest.fn(),
            findByReceiveId: jest.fn(),
            respondToFriendRequest: jest.fn(),
            findAllFriendship: jest.fn(),
            removeFriendship: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FriendshipController>(FriendshipController);
    friendshipService = module.get(FriendshipService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendFriendRequest', () => {
    const mockDto: SendFriendRequestDto = {
      receiverId: 2,
    } as SendFriendRequestDto;

    it('친구 요청을 성공적으로 전송한다.', async () => {
      // 1. given
      const mockFriendRequest = createMockFriendshipRequestEntity({
        id: 1,
        senderId: mockUserId,
        receiverId: 2,
        status: FriendRequestStatus.PENDING,
      });
      friendshipService.requestFriendship.mockResolvedValue(mockFriendRequest);

      // 2. when
      const result = await controller.sendFriendRequest(mockDto, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(friendshipService.requestFriendship).toHaveBeenCalledWith(
        expect.objectContaining({
          senderId: mockUserId,
          receiverId: mockDto.receiverId,
        }),
      );
    });

    it('자기 자신에게 친구 요청 시 BadRequestException을 발생시킨다.', async () => {
      // 1. given
      const invalidDto: SendFriendRequestDto = {
        receiverId: mockUserId,
      } as SendFriendRequestDto;

      // 2. when & then
      await expect(controller.sendFriendRequest(invalidDto, mockUserId)).rejects.toThrow(BadRequestException);
      await expect(controller.sendFriendRequest(invalidDto, mockUserId)).rejects.toThrow(
        HttpFriendshipErrorConstants.SAME_USER_ID.message as string,
      );
      expect(friendshipService.requestFriendship).not.toHaveBeenCalled();
    });

    it('FriendshipService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const error = new Error('Service error');
      friendshipService.requestFriendship.mockRejectedValue(error);

      // when & then
      await expect(controller.sendFriendRequest(mockDto, mockUserId)).rejects.toThrow(error);
    });
  });

  describe('findByReceiveId', () => {
    it('나에게 요청을 보낸 사용자 정보를 조회한다.', async () => {
      // 1. given
      const mockSender1 = createMockUserEntity({ id: 2, email: 'sender1@test.com', name: 'Sender 1' });
      const mockSender2 = createMockUserEntity({ id: 3, email: 'sender2@test.com', name: 'Sender 2' });
      const mockFriendRequests = [
        createMockFriendshipRequestEntity({ id: 1, senderId: 2, receiverId: mockUserId, sender: mockSender1 }),
        createMockFriendshipRequestEntity({ id: 2, senderId: 3, receiverId: mockUserId, sender: mockSender2 }),
      ];
      friendshipService.findByReceiveId.mockResolvedValue(mockFriendRequests);

      // when
      const result = await controller.findByReceiveId(mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.findByReceiveId).toHaveBeenCalledWith(mockUserId);
    });

    it('요청이 없으면 빈 배열을 반환한다.', async () => {
      // 1. given
      friendshipService.findByReceiveId.mockResolvedValue([]);

      // 2. when
      const result = await controller.findByReceiveId(mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.findByReceiveId).toHaveBeenCalledWith(mockUserId);
    });

    it('FriendshipService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const error = new Error('Service error');
      friendshipService.findByReceiveId.mockRejectedValue(error);

      // 2. when & then
      await expect(controller.findByReceiveId(mockUserId)).rejects.toThrow(error);
    });
  });

  describe('respondToFriendRequest', () => {
    const friendRequestId = 1;

    it('친구 요청을 수락한다.', async () => {
      // 1. given
      const mockDto: RespondToFriendRequestDto = {
        status: FriendRequestStatus.ACCEPTED,
      } as RespondToFriendRequestDto;
      friendshipService.respondToFriendRequest.mockResolvedValue('친구 요청을 수락하였습니다.');

      // 2. when
      const result = await controller.respondToFriendRequest(friendRequestId, mockDto, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.respondToFriendRequest).toHaveBeenCalledWith(
        friendRequestId,
        FriendRequestStatus.ACCEPTED,
        mockUserId,
      );
    });

    it('친구 요청을 거절한다.', async () => {
      // 1. given
      const mockDto: RespondToFriendRequestDto = {
        status: FriendRequestStatus.REJECTED,
      } as RespondToFriendRequestDto;
      friendshipService.respondToFriendRequest.mockResolvedValue('친구 요청을 거절하였습니다.');

      // 2. when
      const result = await controller.respondToFriendRequest(friendRequestId, mockDto, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.respondToFriendRequest).toHaveBeenCalledWith(
        friendRequestId,
        FriendRequestStatus.REJECTED,
        mockUserId,
      );
    });

    it('FriendshipService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const mockDto: RespondToFriendRequestDto = {
        status: FriendRequestStatus.ACCEPTED,
      } as RespondToFriendRequestDto;
      const error = new Error('Service error');
      friendshipService.respondToFriendRequest.mockRejectedValue(error);

      // 2. when & then
      await expect(controller.respondToFriendRequest(friendRequestId, mockDto, mockUserId)).rejects.toThrow(error);
    });
  });

  describe('findAllFriendship', () => {
    it('페이지네이션과 함께 친구 리스트를 조회한다.', async () => {
      // 1. given
      const mockQuery: PaginationQueryDto = {
        page: 1,
        limit: 20,
      } as PaginationQueryDto;
      const mockResult = {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
      friendshipService.findAllFriendship.mockResolvedValue(mockResult);

      // 2. when
      const result = await controller.findAllFriendship(mockUserId, mockQuery);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.findAllFriendship).toHaveBeenCalledWith(mockUserId, {
        page: 1,
        limit: 20,
      });
    });

    it('페이지네이션 없이 친구 리스트를 조회한다.', async () => {
      // given
      const mockQuery: PaginationQueryDto = {} as PaginationQueryDto;
      const mockResult = {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
      friendshipService.findAllFriendship.mockResolvedValue(mockResult);

      // 2. when
      const result = await controller.findAllFriendship(mockUserId, mockQuery);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.findAllFriendship).toHaveBeenCalledWith(mockUserId, undefined);
    });

    it('page만 제공된 경우 limit은 기본값 20으로 설정된다.', async () => {
      // 1. given
      const mockQuery: PaginationQueryDto = {
        page: 2,
      } as PaginationQueryDto;
      const mockResult = {
        data: [],
        meta: {
          page: 2,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
      friendshipService.findAllFriendship.mockResolvedValue(mockResult);

      // 2. when
      const result = await controller.findAllFriendship(mockUserId, mockQuery);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.findAllFriendship).toHaveBeenCalledWith(mockUserId, {
        page: 2,
        limit: 20,
      });
    });

    it('limit만 제공된 경우 page는 기본값 1로 설정된다.', async () => {
      // 1. given
      const mockQuery: PaginationQueryDto = {
        limit: 10,
      } as PaginationQueryDto;
      const mockResult = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
      friendshipService.findAllFriendship.mockResolvedValue(mockResult);

      // 2. when
      const result = await controller.findAllFriendship(mockUserId, mockQuery);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(friendshipService.findAllFriendship).toHaveBeenCalledWith(mockUserId, {
        page: 1,
        limit: 10,
      });
    });

    it('FriendshipService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const mockQuery: PaginationQueryDto = {} as PaginationQueryDto;
      const error = new Error('Service error');
      friendshipService.findAllFriendship.mockRejectedValue(error);

      // 2. when & then
      await expect(controller.findAllFriendship(mockUserId, mockQuery)).rejects.toThrow(error);
    });
  });

  describe('removeFriendship', () => {
    const friendshipId = 1;

    it('친구 관계를 성공적으로 삭제한다.', async () => {
      // 1. given
      friendshipService.removeFriendship.mockResolvedValue(undefined);

      // 2. when
      const result = await controller.removeFriendship(friendshipId, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(204);
      expect(friendshipService.removeFriendship).toHaveBeenCalledWith(friendshipId, mockUserId);
    });

    it('FriendshipService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const error = new Error('Service error');
      friendshipService.removeFriendship.mockRejectedValue(error);

      // when & then
      await expect(controller.removeFriendship(friendshipId, mockUserId)).rejects.toThrow(error);
    });
  });
});
