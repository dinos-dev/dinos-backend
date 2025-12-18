import { mockDeep } from 'jest-mock-extended';
import { BookmarkService } from 'src/bookmark/application/bookmark.service';
import { IBookmarkRepository } from 'src/bookmark/domain/repository/bookmark.repository.interface';
import { IBookmarkQuery } from 'src/bookmark/application/interface/bookmark-query.interface';
import { createMockBookmarkEntity } from '../../__mocks__/bookmark.factory';
import { RequestBookmarkCommand } from 'src/bookmark/application/command/request-bookmark.command';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';

jest.mock('@nestjs-cls/transactional', () => ({
  ...jest.requireActual('@nestjs-cls/transactional'),
  Transactional: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  },
}));

describe('BookmarkService', () => {
  let service: BookmarkService;
  let bookmarkRepository: jest.Mocked<IBookmarkRepository>;
  let bookmarkQuery: jest.Mocked<IBookmarkQuery>;

  beforeEach(() => {
    bookmarkRepository = mockDeep<IBookmarkRepository>();
    bookmarkQuery = mockDeep<IBookmarkQuery>();

    service = new BookmarkService(bookmarkRepository, bookmarkQuery);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleBookmark', () => {
    const mockCommand = new RequestBookmarkCommand(
      1,
      'feedRefId',
      'itemName',
      'itemSub',
      ItemType.FEED,
      'restaurantRefId',
      'itemImageUrl',
    );

    it('북마크가 존재하지 않으면 새로운 북마크를 생성한다.', async () => {
      // 1. given
      const mockBookmarkEntity = createMockBookmarkEntity({
        id: 1,
        userId: mockCommand.userId,
        feedRefId: mockCommand.feedRefId,
        itemName: mockCommand.itemName,
      });

      bookmarkQuery.findByUniqueBookmark.mockResolvedValue(null);
      bookmarkRepository.create.mockResolvedValue(mockBookmarkEntity);

      // when
      const result = await service.toggleBookmark(mockCommand);

      // 3. then
      expect(result.bookmark).toEqual(mockBookmarkEntity);
      expect(result.action).toBe('create');
      expect(bookmarkQuery.findByUniqueBookmark).toHaveBeenCalledWith(
        mockCommand.userId,
        mockCommand.feedRefId,
        mockCommand.restaurantRefId,
      );
      expect(bookmarkRepository.create).toHaveBeenCalled();
      expect(bookmarkRepository.removeById).not.toHaveBeenCalled();
    });

    it('북마크가 존재하면 해당 북마크를 삭제한다.', async () => {
      // 1. given
      const existingBookmark = createMockBookmarkEntity({
        id: 1,
        userId: mockCommand.userId,
        feedRefId: mockCommand.feedRefId,
      });

      bookmarkQuery.findByUniqueBookmark.mockResolvedValue(existingBookmark);
      bookmarkRepository.removeById.mockResolvedValue(existingBookmark);

      // when
      const result = await service.toggleBookmark(mockCommand);

      // 3. then
      expect(result.bookmark).toEqual(existingBookmark);
      expect(result.action).toBe('delete');
      expect(bookmarkQuery.findByUniqueBookmark).toHaveBeenCalledWith(
        mockCommand.userId,
        mockCommand.feedRefId,
        mockCommand.restaurantRefId,
      );
      expect(bookmarkRepository.removeById).toHaveBeenCalledWith(existingBookmark.id);
      expect(bookmarkRepository.create).not.toHaveBeenCalled();
    });

    it('restaurantRefId가 null인 경우에도 정상적으로 처리한다.', async () => {
      // given
      const commandWithNullRestaurant = new RequestBookmarkCommand(
        1,
        'feedRefId',
        'itemName',
        'itemSub',
        ItemType.FEED,
        null,
        'itemImageUrl',
      );
      const mockBookmarkEntity = createMockBookmarkEntity();

      bookmarkQuery.findByUniqueBookmark.mockResolvedValue(null);
      bookmarkRepository.create.mockResolvedValue(mockBookmarkEntity);

      // 2. when
      const result = await service.toggleBookmark(commandWithNullRestaurant);

      // 3. then
      expect(result.action).toBe('create');
      expect(bookmarkQuery.findByUniqueBookmark).toHaveBeenCalledWith(
        commandWithNullRestaurant.userId,
        commandWithNullRestaurant.feedRefId,
        null,
      );
    });

    it('itemImageUrl이 null인 경우에도 정상적으로 처리한다.', async () => {
      // given
      const commandWithNullImage = new RequestBookmarkCommand(
        1,
        'feedRefId',
        'itemName',
        'itemSub',
        ItemType.FEED,
        'restaurantRefId',
        null,
      );
      const mockBookmarkEntity = createMockBookmarkEntity({
        itemImageUrl: null,
      });

      bookmarkQuery.findByUniqueBookmark.mockResolvedValue(null);
      bookmarkRepository.create.mockResolvedValue(mockBookmarkEntity);

      // 2. when
      const result = await service.toggleBookmark(commandWithNullImage);

      // then
      expect(result.action).toBe('create');
      expect(bookmarkRepository.create).toHaveBeenCalled();
    });
  });

  describe('findFilterBookmark', () => {
    const userId = 1;
    const itemType = ItemType.FEED;

    it('페이지네이션 옵션과 함께 북마크 필터 조회를 성공적으로 처리한다.', async () => {
      // 1. given
      const paginationOptions = { page: 1, limit: 20 };
      const mockResult = {
        data: [createMockBookmarkEntity()],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      bookmarkQuery.findFilterBookmark.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.findFilterBookmark(userId, itemType, paginationOptions);

      // then
      expect(result).toEqual(mockResult);
      expect(bookmarkQuery.findFilterBookmark).toHaveBeenCalledWith(userId, itemType, paginationOptions);
    });

    it('페이지네이션 옵션 없이 북마크 필터 조회를 성공적으로 처리한다.', async () => {
      // 1. given
      const mockResult = {
        data: [createMockBookmarkEntity(), createMockBookmarkEntity({ id: 2 })],
        meta: {
          page: 1,
          limit: 2,
          total: 2,
          totalPages: 1,
        },
      };

      bookmarkQuery.findFilterBookmark.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.findFilterBookmark(userId, itemType);

      // 3. then
      expect(result).toEqual(mockResult);
      expect(bookmarkQuery.findFilterBookmark).toHaveBeenCalledWith(userId, itemType, undefined);
    });

    it('RESTAURANT 타입으로 필터 조회를 성공적으로 처리한다.', async () => {
      // 1. given
      const mockResult = {
        data: [
          createMockBookmarkEntity({
            itemType: ItemType.RESTAURANT,
            restaurantRefId: 'restaurantRefId',
          }),
        ],
        meta: {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
        },
      };

      bookmarkQuery.findFilterBookmark.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.findFilterBookmark(userId, ItemType.RESTAURANT);

      // 3. then
      expect(result).toEqual(mockResult);
      expect(bookmarkQuery.findFilterBookmark).toHaveBeenCalledWith(userId, ItemType.RESTAURANT, undefined);
    });

    it('북마크가 없는 경우 빈 배열을 반환한다.', async () => {
      // 1. given
      const mockResult = {
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      bookmarkQuery.findFilterBookmark.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.findFilterBookmark(userId, itemType, { page: 1, limit: 20 });

      // then
      expect(result).toEqual(mockResult);
      expect(result.data).toHaveLength(0);
    });
  });
});
