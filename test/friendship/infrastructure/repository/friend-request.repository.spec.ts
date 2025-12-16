import { FriendRequestRepository } from 'src/friendship/infrastructure/repository/friend-request.repository';
import { mockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../../__mocks__/transaction-host.mock';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockFriendshipRequest, createMockFriendshipRequestEntity } from '../../../__mocks__/friendship.factory';
import { FriendRequestMapper } from 'src/friendship/infrastructure/mapper/friend-request.mapper';
import { FriendRequestStatus as DomainFriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';

describe('FriendRequestRepository', () => {
  let repository: FriendRequestRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  const friendRequestMockEntity = createMockFriendshipRequestEntity();
  const friendRequestDataBaseEntity = createMockFriendshipRequest();

  beforeEach(async () => {
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendRequestRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<FriendRequestRepository>(FriendRequestRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertRequestFriendInvite', () => {
    it('친구 요청을 보냈을 때, 친구 요청 정보가 없을 경우 생성한다.', async () => {
      // 1.given
      txHost.tx.friendRequest.upsert.mockResolvedValue(friendRequestDataBaseEntity);
      // 2. when
      const result = await repository.upsertRequestFriendInvite(friendRequestMockEntity);
      // 3. then
      expect(txHost.tx.friendRequest.upsert).toHaveBeenCalledWith({
        where: {
          senderId_receiverId: {
            senderId: friendRequestMockEntity.senderId,
            receiverId: friendRequestMockEntity.receiverId,
          },
        },
        update: {
          status: friendRequestMockEntity.status,
          respondedAt: friendRequestMockEntity.respondedAt,
          version: { increment: 1 },
        },
        create: {
          senderId: friendRequestMockEntity.senderId,
          receiverId: friendRequestMockEntity.receiverId,
          status: friendRequestMockEntity.status,
        },
      });
      expect(result).toEqual(FriendRequestMapper.toDomain(friendRequestDataBaseEntity));
    });
    it('친구 요청을 보냈을 때, 친구 요청 정보가 있을 경우 업데이트한다.', async () => {
      // 1.given
      const fixedDate = new Date();

      const updatedFriendRequestEntity = createMockFriendshipRequestEntity({
        status: DomainFriendRequestStatus.PENDING,
        respondedAt: fixedDate,
        createdAt: fixedDate,
        expiresAt: fixedDate,
        updatedAt: fixedDate,
        version: 2,
      });
      txHost.tx.friendRequest.upsert.mockResolvedValue(updatedFriendRequestEntity);
      // 2. when
      const result = await repository.upsertRequestFriendInvite(friendRequestMockEntity);
      // 3. then
      expect(txHost.tx.friendRequest.upsert).toHaveBeenCalledWith({
        where: {
          senderId_receiverId: {
            senderId: friendRequestMockEntity.senderId,
            receiverId: friendRequestMockEntity.receiverId,
          },
        },
        update: {
          status: friendRequestMockEntity.status,
          respondedAt: friendRequestMockEntity.respondedAt,
          version: { increment: 1 },
        },
        create: {
          senderId: friendRequestMockEntity.senderId,
          receiverId: friendRequestMockEntity.receiverId,
          status: friendRequestMockEntity.status,
        },
      });
      expect(result).toEqual(FriendRequestMapper.toDomain(updatedFriendRequestEntity));
    });
  });

  describe('findByReceiveId', () => {
    it('나에게 요청을 보낸 친구 요청 정보와 상대방 프로필을 조회한다.', async () => {
      // 1.given
      // 2. when
      // 3. then
    });
  });

  describe('removeByReceiverAndSenderId', () => {
    it('receiverId와 senderId에 해당하는 친구 요청 기록을 제거한다.', async () => {
      // 1.given
      // 2. when
      // 3. then
    });
  });
});
