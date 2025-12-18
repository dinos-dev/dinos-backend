import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from 'src/bookmark/presentation/bookmark.controller';
import { BookmarkService } from 'src/bookmark/application/bookmark.service';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';
import { createMockBookmarkEntity } from '../../__mocks__/bookmark.factory';
import { ToggleBookmarkDto } from 'src/bookmark/presentation/dto/request/toggle.bookmark.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

describe('BookmarkController', () => {
  let controller: BookmarkController;
  let bookmarkService: jest.Mocked<BookmarkService>;

  const mockBookmarkEntity = createMockBookmarkEntity();
  const mockUserId = 1;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        {
          provide: BookmarkService,
          useValue: {
            toggleBookmark: jest.fn(),
            findFilterBookmark: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
    bookmarkService = module.get(BookmarkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleBookmark', () => {
    const mockToggleDto: ToggleBookmarkDto = {
      feedRefId: 'feedRefId',
      itemName: 'itemName',
      itemSub: 'itemSub',
      itemType: ItemType.FEED,
      restaurantRefId: 'restaurantRefId',
      itemImageUrl: 'itemImageUrl',
    };

    it('북마크 생성 시 action이 create인 결과를 반환한다.', async () => {
      // 1. given
      bookmarkService.toggleBookmark.mockResolvedValue({
        bookmark: mockBookmarkEntity,
        action: 'create',
      });

      // 2. when
      const result = await controller.toggleBookmark(mockToggleDto, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(bookmarkService.toggleBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          feedRefId: mockToggleDto.feedRefId,
          itemName: mockToggleDto.itemName,
          itemSub: mockToggleDto.itemSub,
          itemType: mockToggleDto.itemType,
          restaurantRefId: mockToggleDto.restaurantRefId,
          itemImageUrl: mockToggleDto.itemImageUrl,
        }),
      );
    });

    it('북마크 삭제 시 action이 delete인 결과를 반환한다.', async () => {
      // 1. given
      bookmarkService.toggleBookmark.mockResolvedValue({
        bookmark: mockBookmarkEntity,
        action: 'delete',
      });

      // 2. when
      const result = await controller.toggleBookmark(mockToggleDto, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(bookmarkService.toggleBookmark).toHaveBeenCalled();
    });

    it('restaurantRefId가 없는 경우 null로 처리한다.', async () => {
      // 1. given
      const dtoWithoutRestaurantRefId = {
        ...mockToggleDto,
        restaurantRefId: undefined,
      };
      bookmarkService.toggleBookmark.mockResolvedValue({
        bookmark: mockBookmarkEntity,
        action: 'create',
      });

      // 2. when
      await controller.toggleBookmark(dtoWithoutRestaurantRefId, mockUserId);

      // 3. then
      expect(bookmarkService.toggleBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurantRefId: null,
        }),
      );
    });

    it('itemImageUrl이 없는 경우 null로 처리한다.', async () => {
      // 1. given
      const dtoWithoutItemImageUrl = {
        ...mockToggleDto,
        itemImageUrl: undefined,
      };
      bookmarkService.toggleBookmark.mockResolvedValue({
        bookmark: mockBookmarkEntity,
        action: 'create',
      });

      // 2. when
      await controller.toggleBookmark(dtoWithoutItemImageUrl, mockUserId);

      // 3. then
      expect(bookmarkService.toggleBookmark).toHaveBeenCalledWith(
        expect.objectContaining({
          itemImageUrl: null,
        }),
      );
    });

    it('BookmarkService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const error = new Error('Service error');
      bookmarkService.toggleBookmark.mockRejectedValue(error);

      // 2. when & 3. then
      await expect(controller.toggleBookmark(mockToggleDto, mockUserId)).rejects.toThrow(error);
    });
  });

  describe('findFilterBookmark', () => {
    const mockPaginationQuery: PaginationQueryDto = {
      page: 1,
      limit: 20,
    };

    const mockPaginatedResult = {
      data: [mockBookmarkEntity],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    it('페이지네이션 옵션과 함께 북마크 필터 조회를 성공적으로 처리한다.', async () => {
      // 1. given
      bookmarkService.findFilterBookmark.mockResolvedValue(mockPaginatedResult);

      // 2. when
      const result = await controller.findFilterBookmark(mockPaginationQuery, ItemType.FEED, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(bookmarkService.findFilterBookmark).toHaveBeenCalledWith(mockUserId, ItemType.FEED, {
        page: 1,
        limit: 20,
      });
    });

    it('페이지네이션 옵션이 없는 경우 undefined로 처리한다.', async () => {
      // 1. given
      const emptyQuery: PaginationQueryDto = {};
      bookmarkService.findFilterBookmark.mockResolvedValue(mockPaginatedResult);

      // 2. when
      await controller.findFilterBookmark(emptyQuery, ItemType.FEED, mockUserId);

      // 3. then
      expect(bookmarkService.findFilterBookmark).toHaveBeenCalledWith(mockUserId, ItemType.FEED, undefined);
    });

    it('page만 있는 경우 limit은 기본값 20으로 설정한다.', async () => {
      // 1. given
      const queryWithPageOnly: PaginationQueryDto = { page: 2 };
      bookmarkService.findFilterBookmark.mockResolvedValue(mockPaginatedResult);

      // 2. when
      await controller.findFilterBookmark(queryWithPageOnly, ItemType.FEED, mockUserId);

      // 3. then
      expect(bookmarkService.findFilterBookmark).toHaveBeenCalledWith(mockUserId, ItemType.FEED, {
        page: 2,
        limit: 20,
      });
    });

    it('limit만 있는 경우 page는 기본값 1로 설정한다.', async () => {
      // 1. given
      const queryWithLimitOnly: PaginationQueryDto = { limit: 10 };
      bookmarkService.findFilterBookmark.mockResolvedValue(mockPaginatedResult);

      // 2. when
      await controller.findFilterBookmark(queryWithLimitOnly, ItemType.FEED, mockUserId);

      // 3. then
      expect(bookmarkService.findFilterBookmark).toHaveBeenCalledWith(mockUserId, ItemType.FEED, {
        page: 1,
        limit: 10,
      });
    });

    it('RESTAURANT 타입으로 필터 조회를 성공적으로 처리한다.', async () => {
      // 1. given
      bookmarkService.findFilterBookmark.mockResolvedValue(mockPaginatedResult);

      // 2. when
      const result = await controller.findFilterBookmark(mockPaginationQuery, ItemType.RESTAURANT, mockUserId);

      // 3. then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(bookmarkService.findFilterBookmark).toHaveBeenCalledWith(mockUserId, ItemType.RESTAURANT, {
        page: 1,
        limit: 20,
      });
    });

    it('BookmarkService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const error = new Error('Service error');
      bookmarkService.findFilterBookmark.mockRejectedValue(error);

      // when & then
      await expect(controller.findFilterBookmark(mockPaginationQuery, ItemType.FEED, mockUserId)).rejects.toThrow(
        error,
      );
    });
  });
});
