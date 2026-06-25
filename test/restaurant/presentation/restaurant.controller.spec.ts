import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantController } from '../../../src/restaurant/presentation/restaurant.controller';
import { RestaurantService } from '../../../src/restaurant/application/restaurant.service';
import { RestaurantSearchResult } from '../../../src/restaurant/application/dto/restaurant-search.result';

describe('RestaurantController', () => {
  let controller: RestaurantController;
  let restaurantService: jest.Mocked<RestaurantService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        {
          provide: RestaurantService,
          useValue: {
            searchNearby: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
    restaurantService = module.get(RestaurantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchNearby', () => {
    it('returns mapped restaurant search results', async () => {
      restaurantService.searchNearby.mockResolvedValue([
        new RestaurantSearchResult(1, '서래돈까스', '서울시 강남구', 37.5, 127.01, '일식', null, 0.3),
      ]);

      const result = await controller.searchNearby({
        latitude: 37.5,
        longitude: 127.0,
        keyword: '돈까스',
        radiusMeters: 3000,
        limit: 50,
      });

      expect(restaurantService.searchNearby).toHaveBeenCalledWith({
        latitude: 37.5,
        longitude: 127.0,
        keyword: '돈까스',
        radiusMeters: 3000,
        limit: 50,
      });
      expect((result as any).result).toEqual([
        {
          id: 1,
          name: '서래돈까스',
          address: '서울시 강남구',
          latitude: 37.5,
          longitude: 127.01,
          category: '일식',
          primaryImageUrl: null,
          distanceKm: 0.3,
        },
      ]);
    });
  });
});
