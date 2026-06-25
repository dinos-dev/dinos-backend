import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RestaurantService } from '../../../src/restaurant/application/restaurant.service';
import { RESTAURANT_SEARCH_QUERY_REPOSITORY } from '../../../src/common/config/common.const';
import { IRestaurantSearchQuery } from '../../../src/restaurant/application/interface/restaurant-search-query.interface';
import { RestaurantSearchResult } from '../../../src/restaurant/application/dto/restaurant-search.result';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let restaurantSearchQuery: jest.Mocked<IRestaurantSearchQuery>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: RESTAURANT_SEARCH_QUERY_REPOSITORY,
          useValue: {
            searchNearby: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    restaurantSearchQuery = module.get(RESTAURANT_SEARCH_QUERY_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchNearby', () => {
    it('trims keyword and delegates nearby restaurant search to repository', async () => {
      const restaurants = [
        new RestaurantSearchResult(1, '서래돈까스', '서울시 강남구', 37.5, 127.01, '일식', null, 0.3),
      ];
      restaurantSearchQuery.searchNearby.mockResolvedValue(restaurants);

      const result = await service.searchNearby({
        latitude: 37.5,
        longitude: 127.0,
        keyword: '  돈까스  ',
        radiusMeters: 3000,
        limit: 50,
      });

      expect(result).toBe(restaurants);
      expect(restaurantSearchQuery.searchNearby).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 37.5,
          longitude: 127.0,
          radiusMeters: 3000,
          keyword: '돈까스',
          limit: 50,
        }),
      );
    });

    it('uses 10km as the default search radius when radiusMeters is omitted', async () => {
      restaurantSearchQuery.searchNearby.mockResolvedValue([]);

      await service.searchNearby({
        latitude: 37.5,
        longitude: 127.0,
        keyword: '돈까스',
        limit: 50,
      });

      expect(restaurantSearchQuery.searchNearby).toHaveBeenCalledWith(
        expect.objectContaining({
          radiusMeters: 10000,
        }),
      );
    });

    it('throws BadRequestException when keyword is blank after trim', async () => {
      await expect(
        service.searchNearby({
          latitude: 37.5,
          longitude: 127.0,
          keyword: '   ',
          radiusMeters: 3000,
          limit: 50,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(restaurantSearchQuery.searchNearby).not.toHaveBeenCalled();
    });
  });
});
