import { Test, TestingModule } from '@nestjs/testing';
import { PinService } from '../../../src/pin/application/pin.service';
import { PIN_QUERY_REPOSITORY, PIN_REPOSITORY, RESTAURANT_REPOSITORY } from '../../../src/common/config/common.const';
import { WinstonLoggerService } from '../../../src/infrastructure/logger/winston-logger.service';
import { PinWithRestaurantDto } from '../../../src/pin/application/dto/pin-with-restaurant.dto';
import { NearbyPinsQueryDto } from '../../../src/pin/presentation/dto/request/nearby-pins-query.dto';

describe('PinService', () => {
  let service: PinService;
  const pinQueryMock = {
    findNearbyPinnedRestaurants: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinService,
        { provide: PIN_REPOSITORY, useValue: {} },
        { provide: RESTAURANT_REPOSITORY, useValue: {} },
        { provide: PIN_QUERY_REPOSITORY, useValue: pinQueryMock },
        { provide: WinstonLoggerService, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<PinService>(PinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNearbyPins', () => {
    const query: NearbyPinsQueryDto = {
      userLat: 37.5,
      userLng: 127.0,
      minLat: 37.0,
      maxLat: 38.0,
      minLng: 126.0,
      maxLng: 128.0,
      limit: 30,
    };

    it('bbox/옵션을 구성해 pinQuery에 위임하고, 썸네일·리뷰·친구핀수 필드를 포함한 결과를 반환한다', async () => {
      const expected: PinWithRestaurantDto[] = [
        new PinWithRestaurantDto(
          1,
          10,
          'A식당',
          37.5,
          127.0,
          '서울 강남',
          '한식',
          1.2,
          new Date('2026-06-02T10:00:00Z'),
          'https://img/A.jpg',
          '최신 리뷰',
          3,
        ),
      ];
      pinQueryMock.findNearbyPinnedRestaurants.mockResolvedValue(expected);

      const result = await service.getNearbyPins(99, query);

      expect(result).toBe(expected);
      expect(result[0].primaryImageUrl).toBe('https://img/A.jpg');
      expect(result[0].myReviewContent).toBe('최신 리뷰');
      expect(result[0].friendPinCount).toBe(3);

      const [userIdArg, bboxArg, optionsArg] = pinQueryMock.findNearbyPinnedRestaurants.mock.calls[0];
      expect(userIdArg).toBe(99);
      expect(bboxArg).toEqual(expect.objectContaining({ minLat: 37.0, maxLat: 38.0, minLng: 126.0, maxLng: 128.0 }));
      expect(optionsArg).toEqual(expect.objectContaining({ userLat: 37.5, userLng: 127.0, limit: 30 }));
    });
  });
});
