import { BookmarkRepository } from 'src/bookmark/infrastructure/repository/bookmark.repository';
import { mockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../../__mocks__/transaction-host.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionHost } from '@nestjs-cls/transactional';
import { createMockBookmark, createMockBookmarkEntity } from '../../../__mocks__/bookmark.factory';
import { BookmarkMapper } from 'src/bookmark/infrastructure/mapper/bookmark.mapper';

describe('BookmarkRepository', () => {
  let repository: BookmarkRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  const bookmarkMockEntity = createMockBookmarkEntity();
  const bookmarkDataBaseEntity = createMockBookmark();

  beforeAll(async () => {
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<BookmarkRepository>(BookmarkRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('북마크를 생성한다.', async () => {
      // 1. given
      txHost.tx.bookmark.create.mockResolvedValue(bookmarkDataBaseEntity);

      // 2. when
      const result = await repository.create(bookmarkMockEntity);

      // 3. then
      expect(txHost.tx.bookmark.create).toHaveBeenCalledWith({
        data: {
          itemType: bookmarkMockEntity.itemType,
          feedRefId: bookmarkMockEntity.feedRefId,
          restaurantRefId: bookmarkMockEntity.restaurantRefId,
          itemName: bookmarkMockEntity.itemName,
          itemImageUrl: bookmarkMockEntity.itemImageUrl,
          itemSub: bookmarkMockEntity.itemSub,
          user: {
            connect: { id: bookmarkMockEntity.userId },
          },
        },
      });
      const expectedBookmark = BookmarkMapper.toDomain(bookmarkDataBaseEntity);
      expect(result).toEqual(expectedBookmark);
    });
  });
});
