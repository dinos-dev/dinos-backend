import { TransactionHost } from '@nestjs-cls/transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkQueryRepository } from 'src/bookmark/infrastructure/query/bookmark.query';
import { mockPrismaService, MockPrismaService } from '../../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../../__mocks__/transaction-host.mock';
import { createMockBookmark } from '../../../__mocks__/bookmark.factory';
import { BookmarkMapper } from 'src/bookmark/infrastructure/mapper/bookmark.mapper';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';

describe('BookmarkQueryRepository', () => {
  let queryRepository: BookmarkQueryRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  //   const bookmarkMockEntity = createMockBookmarkEntity();
  const bookmarkDataBaseEntity = createMockBookmark();

  beforeAll(async () => {
    prismaService = mockPrismaService();
    txHost = mockTransactionHost(prismaService);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkQueryRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    queryRepository = module.get<BookmarkQueryRepository>(BookmarkQueryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUniqueBookmark', () => {
    it('restaurantRefId가 제공된 경우 해당 값을 사용하여 북마크를 조회한다.', async () => {
      // 1. given
      const userId = 1;
      const feedRefId = 'feedRefId';
      const restaurantRefId = 'restaurantRefId';

      prismaService.bookmark.findUnique.mockResolvedValue(bookmarkDataBaseEntity);

      // 2. when
      const result = await queryRepository.findByUniqueBookmark(userId, feedRefId, restaurantRefId);

      // 3. then
      expect(txHost.tx.bookmark.findUnique).toHaveBeenCalledWith({
        where: {
          unique_user_bookmark: {
            userId,
            feedRefId,
            restaurantRefId,
          },
        },
      });
      const expectedBookmark = BookmarkMapper.toDomain(bookmarkDataBaseEntity);
      expect(result).toEqual(expectedBookmark);
    });
  });
  it('restaurantRefId가 제공되지 않은 경우 __FEED_ONLY__를 사용하여 북마크를 조회한다.', async () => {
    // 1. given
    const userId = 1;
    const feedRefId = 'feedRefId';

    prismaService.bookmark.findUnique.mockResolvedValue(bookmarkDataBaseEntity);

    // 2. when
    const result = await queryRepository.findByUniqueBookmark(userId, feedRefId);

    // 3. then
    expect(prismaService.bookmark.findUnique).toHaveBeenCalledWith({
      where: {
        unique_user_bookmark: {
          userId,
          feedRefId,
          restaurantRefId: '__FEED_ONLY__', // 기본값 사용
        },
      },
    });
    const expectedBookmark = BookmarkMapper.toDomain(bookmarkDataBaseEntity);
    expect(result).toEqual(expectedBookmark);
  });

  it('restaurantRefId가 null인 경우 __FEED_ONLY__를 사용하여 북마크를 조회한다.', async () => {
    // 1. given
    const userId = 1;
    const feedRefId = 'feedRefId';
    const restaurantRefId = null;

    prismaService.bookmark.findUnique.mockResolvedValue(bookmarkDataBaseEntity);

    // 2. when
    const result = await queryRepository.findByUniqueBookmark(userId, feedRefId, restaurantRefId);

    // 3. then
    expect(prismaService.bookmark.findUnique).toHaveBeenCalledWith({
      where: {
        unique_user_bookmark: {
          userId,
          feedRefId,
          restaurantRefId: '__FEED_ONLY__', // null이면 기본값 사용
        },
      },
    });
    const expectedBookmark = BookmarkMapper.toDomain(bookmarkDataBaseEntity);
    expect(result).toEqual(expectedBookmark);
  });

  it('북마크가 존재하지 않는 경우 null을 반환한다.', async () => {
    // 1. given
    const userId = 1;
    const feedRefId = 'feedRefId';
    const restaurantRefId = 'restaurantRefId';

    prismaService.bookmark.findUnique.mockResolvedValue(null);

    // 2. when
    const result = await queryRepository.findByUniqueBookmark(userId, feedRefId, restaurantRefId);

    // 3. then
    expect(result).toBeNull();
  });

  describe('findFilterBookmark', () => {
    const userId = 1;
    const itemType = ItemType.FEED;

    it('페이지네이션 옵션 없이 북마크를 조회하면 모든 북마크를 반환한다.', async () => {
      // 1. given
      const mockBookmarks = [bookmarkDataBaseEntity, { ...bookmarkDataBaseEntity, id: 2 }];
      prismaService.bookmark.findMany.mockResolvedValue(mockBookmarks);

      // 2. when
      const result = await queryRepository.findFilterBookmark(userId, itemType);

      // 3. then
      expect(prismaService.bookmark.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          itemType,
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
    });

    it('페이지네이션 옵션과 함께 북마크를 조회한다.', async () => {
      // 1. given
      const paginationOptions = { page: 1, limit: 20 };
      const mockBookmarks = [bookmarkDataBaseEntity];

      prismaService.bookmark.count.mockResolvedValue(1);
      prismaService.bookmark.findMany.mockResolvedValue(mockBookmarks);

      // 2. when
      const result = await queryRepository.findFilterBookmark(userId, itemType, paginationOptions);

      // 3. then
      expect(prismaService.bookmark.count).toHaveBeenCalledWith({
        where: {
          userId,
          itemType,
        },
      });
      expect(prismaService.bookmark.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          itemType,
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('페이지네이션으로 2페이지를 조회한다.', async () => {
      // 1. given
      const paginationOptions = { page: 2, limit: 10 };
      const mockBookmarks = [bookmarkDataBaseEntity];

      prismaService.bookmark.count.mockResolvedValue(15);
      prismaService.bookmark.findMany.mockResolvedValue(mockBookmarks);

      // 2. when
      const result = await queryRepository.findFilterBookmark(userId, itemType, paginationOptions);

      // 3. then
      expect(prismaService.bookmark.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          itemType,
        },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 15,
        totalPages: 2,
      });
    });

    it('RESTAURANT 타입으로 필터링된 북마크를 조회한다.', async () => {
      // 1. given
      const restaurantType = ItemType.RESTAURANT;
      const mockBookmarks = [{ ...bookmarkDataBaseEntity, itemType: restaurantType as any }];

      prismaService.bookmark.findMany.mockResolvedValue(mockBookmarks);

      // 2. when
      const result = await queryRepository.findFilterBookmark(userId, restaurantType);

      // 3. then
      expect(prismaService.bookmark.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          itemType: restaurantType,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result.data).toHaveLength(1);
    });

    it('북마크가 없는 경우 빈 배열을 반환한다.', async () => {
      // 1. given
      prismaService.bookmark.findMany.mockResolvedValue([]);

      // 2. when
      const result = await queryRepository.findFilterBookmark(userId, itemType);

      // 3. then
      expect(result.data).toHaveLength(0);
      expect(result.meta).toEqual({
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 1,
      });
    });
  });
});
