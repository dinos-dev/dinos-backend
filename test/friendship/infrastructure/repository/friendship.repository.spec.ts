import { FriendshipRepository } from 'src/friendship/infrastructure/repository/friendship.repository';
import { mockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../../__mocks__/transaction-host.mock';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockFriendship, createMockFriendshipEntity } from '../../../__mocks__/friendship.factory';
import { FriendshipMapper } from 'src/friendship/infrastructure/mapper/friendship.mapper';

describe('FriendshipRepository', () => {
  let repository: FriendshipRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  const friendshipMockEntity = createMockFriendshipEntity();
  const friendshipDataBaseEntity = createMockFriendship();

  beforeEach(async () => {
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<FriendshipRepository>(FriendshipRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserPair', () => {
    it('requesterId→addresseeId 방향으로 친구 관계를 조회한다.', async () => {
      // 1. given
      txHost.tx.friendship.findFirst.mockResolvedValue(friendshipDataBaseEntity);

      // 2. when
      const result = await repository.findByUserPair(
        friendshipMockEntity.requesterId,
        friendshipMockEntity.addresseeId,
      );

      // 3. then
      expect(txHost.tx.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { requesterId: friendshipMockEntity.requesterId, addresseeId: friendshipMockEntity.addresseeId },
            { requesterId: friendshipMockEntity.addresseeId, addresseeId: friendshipMockEntity.requesterId },
          ],
        },
      });
      expect(result).toEqual(FriendshipMapper.toDomain(friendshipDataBaseEntity));
    });

    it('addresseeId→requesterId 역방향으로도 친구 관계를 조회한다.', async () => {
      // 1. given
      txHost.tx.friendship.findFirst.mockResolvedValue(friendshipDataBaseEntity);

      // 2. when
      const result = await repository.findByUserPair(
        friendshipMockEntity.addresseeId,
        friendshipMockEntity.requesterId,
      );

      // 3. then
      expect(txHost.tx.friendship.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { requesterId: friendshipMockEntity.addresseeId, addresseeId: friendshipMockEntity.requesterId },
            { requesterId: friendshipMockEntity.requesterId, addresseeId: friendshipMockEntity.addresseeId },
          ],
        },
      });
      expect(result).toEqual(FriendshipMapper.toDomain(friendshipDataBaseEntity));
    });

    it('친구 관계가 존재하지 않으면 null을 반환한다.', async () => {
      // 1. given
      txHost.tx.friendship.findFirst.mockResolvedValue(null);

      // 2. when
      const result = await repository.findByUserPair(
        friendshipMockEntity.requesterId,
        friendshipMockEntity.addresseeId,
      );

      // 3. then
      expect(result).toBeNull();
    });
  });

  describe('upsertFriendship', () => {
    it('친구관계 테이블에 requesterId와 addresseeId가 존재하지 않을 경우 생성한다.', async () => {
      // 1. given
      txHost.tx.friendship.upsert.mockResolvedValue(friendshipDataBaseEntity);
      // 2. when
      const result = await repository.upsertFriendship(friendshipMockEntity);
      // 3. then
      expect(txHost.tx.friendship.upsert).toHaveBeenCalledWith({
        where: {
          requesterId_addresseeId: {
            requesterId: friendshipMockEntity.requesterId,
            addresseeId: friendshipMockEntity.addresseeId,
          },
        },
        create: {
          requesterId: friendshipMockEntity.requesterId,
          addresseeId: friendshipMockEntity.addresseeId,
        },
        update: {
          version: { increment: 1 },
        },
      });
      expect(result).toEqual(FriendshipMapper.toDomain(friendshipDataBaseEntity));
    });
    it('친구관계 테이블에 requesterId와 addresseeId가 존재할 경우 version을 증가시킨다.', async () => {
      // 1. given
      const updatedFriendshipEntity = createMockFriendshipEntity({
        version: 2,
      });
      txHost.tx.friendship.upsert.mockResolvedValue(updatedFriendshipEntity);
      // 2. when
      const result = await repository.upsertFriendship(friendshipMockEntity);
      // 3. then
      expect(txHost.tx.friendship.upsert).toHaveBeenCalledWith({
        where: {
          requesterId_addresseeId: {
            requesterId: friendshipMockEntity.requesterId,
            addresseeId: friendshipMockEntity.addresseeId,
          },
        },
        create: {
          requesterId: friendshipMockEntity.requesterId,
          addresseeId: friendshipMockEntity.addresseeId,
        },
        update: {
          version: { increment: 1 },
        },
      });
      expect(result).toEqual(FriendshipMapper.toDomain(updatedFriendshipEntity));
    });
  });
});
