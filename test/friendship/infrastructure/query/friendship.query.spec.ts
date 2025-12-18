import { FriendshipQueryRepository } from 'src/friendship/infrastructure/query/friendship.query';
import { mockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../../__mocks__/transaction-host.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionHost } from '@nestjs-cls/transactional';

describe('FriendshipQueryRepository', () => {
  let repository: FriendshipQueryRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  beforeAll(async () => {
    prismaService = mockPrismaService();
    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipQueryRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<FriendshipQueryRepository>(FriendshipQueryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllFriendship', () => {
    const userId = 1;
    const mockFriendshipWithRelations = [
      {
        id: 1,
        requesterId: 1,
        addresseeId: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        version: 1,
        _count: {
          activities: 5,
        },
        requester: {
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
          profile: {
            nickname: 'Nick1',
            comment: 'Hello',
            headerId: 1,
            bodyId: 1,
            headerColor: '#ffffff',
            bodyColor: '#000000',
          },
        },
        addressee: {
          id: 2,
          email: 'user2@example.com',
          name: 'User 2',
          profile: {
            nickname: 'Nick2',
            comment: 'Hi',
            headerId: 2,
            bodyId: 2,
            headerColor: '#ff0000',
            bodyColor: '#00ff00',
          },
        },
      },
      {
        id: 2,
        requesterId: 3,
        addresseeId: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        version: 1,
        _count: {
          activities: 3,
        },
        requester: {
          id: 3,
          email: 'user3@example.com',
          name: 'User 3',
          profile: {
            nickname: 'Nick3',
            comment: 'Hey',
            headerId: 3,
            bodyId: 3,
            headerColor: '#0000ff',
            bodyColor: '#ffff00',
          },
        },
        addressee: {
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
          profile: {
            nickname: 'Nick1',
            comment: 'Hello',
            headerId: 1,
            bodyId: 1,
            headerColor: '#ffffff',
            bodyColor: '#000000',
          },
        },
      },
    ];

    it('페이징 옵션 없이 전체 친구 리스트를 조회한다', async () => {
      // 1.given
      txHost.tx.friendship.findMany.mockResolvedValue(mockFriendshipWithRelations);

      // 2. when
      const result = await repository.findAllFriendship(userId);

      // 3. then
      expect(txHost.tx.friendship.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        include: {
          _count: {
            select: {
              activities: true,
            },
          },
          requester: {
            include: {
              profile: true,
            },
          },
          addressee: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        page: 1,
        limit: 2,
        total: 2,
        totalPages: 1,
      });

      // 첫 번째 친구는 addressee (userId가 requester이므로)
      expect(result.data[0].friendUserId).toBe(2);
      expect(result.data[0].email).toBe('user2@example.com');
      expect(result.data[0].activityCount).toBe(5);

      // 두 번째 친구는 requester (userId가 addressee이므로)
      expect(result.data[1].friendUserId).toBe(3);
      expect(result.data[1].email).toBe('user3@example.com');
      expect(result.data[1].activityCount).toBe(3);
    });

    it('페이징 옵션과 함께 친구 리스트를 조회한다', async () => {
      // 1. given
      const options = { page: 1, limit: 10 };
      const total = 2;

      txHost.tx.friendship.count.mockResolvedValue(total);
      txHost.tx.friendship.findMany.mockResolvedValue(mockFriendshipWithRelations);

      // 2. when
      const result = await repository.findAllFriendship(userId, options);

      // 3. then
      expect(txHost.tx.friendship.count).toHaveBeenCalledWith({
        where: {
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
      });

      expect(txHost.tx.friendship.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        include: {
          _count: {
            select: {
              activities: true,
            },
          },
          requester: {
            include: {
              profile: true,
            },
          },
          addressee: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('두 번째 페이지를 조회할 때 올바른 skip 값을 사용한다', async () => {
      // 1. given
      const options = { page: 2, limit: 10 };
      const total = 25;

      txHost.tx.friendship.count.mockResolvedValue(total);
      txHost.tx.friendship.findMany.mockResolvedValue([mockFriendshipWithRelations[0]]);

      // 2. when
      const result = await repository.findAllFriendship(userId, options);

      // 3. then
      expect(txHost.tx.friendship.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        include: {
          _count: {
            select: {
              activities: true,
            },
          },
          requester: {
            include: {
              profile: true,
            },
          },
          addressee: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 10, // (page 2 - 1) * limit 10
        take: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(3); // Math.ceil(25 / 10)
    });

    it('profile이 없는 친구도 올바르게 처리한다', async () => {
      // 1. given
      const friendshipWithoutProfile = [
        {
          id: 1,
          requesterId: 1,
          addresseeId: 2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          version: 1,
          _count: {
            activities: 0,
          },
          requester: {
            id: 1,
            email: 'user1@example.com',
            name: 'User 1',
            profile: null, // profile이 없는 경우
          },
          addressee: {
            id: 2,
            email: 'user2@example.com',
            name: 'User 2',
            profile: null,
          },
        },
      ];

      txHost.tx.friendship.findMany.mockResolvedValue(friendshipWithoutProfile);

      // 2. when
      const result = await repository.findAllFriendship(userId);

      // 3. then
      expect(result.data).toHaveLength(1);
      expect(result.data[0].friendProfile).toBeNull();
      expect(result.data[0].activityCount).toBe(0);
    });

    it('친구가 없을 때 빈 배열을 반환한다', async () => {
      // 1. given
      txHost.tx.friendship.findMany.mockResolvedValue([]);

      // 2. when
      const result = await repository.findAllFriendship(userId);

      // 3. then
      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 1,
      });
    });
  });
});
