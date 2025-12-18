import { FriendshipActivityRepository } from 'src/friendship/infrastructure/repository/freindship-activity.repostiory';
import { mockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../../__mocks__/transaction-host.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionHost } from '@nestjs-cls/transactional';

describe('FriendshipActivityRepository', () => {
  let repository: FriendshipActivityRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  beforeEach(async () => {
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipActivityRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<FriendshipActivityRepository>(FriendshipActivityRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('removeByFriendshipId', () => {
    it('friendshipId에 해당하는 친구 활동 정보를 제거한다.', async () => {
      // 1. given
      const friendshipId = 1;
      txHost.tx.friendshipActivity.deleteMany.mockResolvedValue({ count: 1 });
      // 2. when
      const result = await repository.removeByFriendshipId(friendshipId);
      // 3. then
      expect(txHost.tx.friendshipActivity.deleteMany).toHaveBeenCalledWith({ where: { friendshipId } });
      expect(result).toBeUndefined();
    });
  });
});
