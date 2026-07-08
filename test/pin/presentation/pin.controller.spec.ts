import { Test, TestingModule } from '@nestjs/testing';
import { PinController } from '../../../src/pin/presentation/pin.controller';
import { PinService } from '../../../src/pin/application/pin.service';
import { PinWithRestaurantDto } from '../../../src/pin/application/dto/pin-with-restaurant.dto';
import { NearbyPinResponseDto } from '../../../src/pin/presentation/dto/response/nearby-pins.response.dto';
import { NearbyPinsQueryDto } from '../../../src/pin/presentation/dto/request/nearby-pins-query.dto';

describe('PinController', () => {
  let controller: PinController;
  const pinServiceMock = {
    getNearbyPins: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinController],
      providers: [
        {
          provide: PinService,
          useValue: pinServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PinController>(PinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNearbyPins', () => {
    const query: NearbyPinsQueryDto = {
      userLat: 37.5,
      userLng: 127.0,
      minLat: 37.0,
      maxLat: 38.0,
      minLng: 126.0,
      maxLng: 128.0,
      limit: 50,
    };

    it('서비스 결과를 응답 DTO로 매핑하며 썸네일·리뷰·친구핀수 필드를 포함한다', async () => {
      const pinnedAt = new Date('2026-06-02T10:00:00Z');
      const serviceResult: PinWithRestaurantDto[] = [
        new PinWithRestaurantDto(
          1,
          10,
          'A식당',
          37.5,
          127.0,
          '서울 강남',
          '한식',
          1.2,
          pinnedAt,
          'https://img/A.jpg',
          '최신 리뷰',
          3,
        ),
      ];
      pinServiceMock.getNearbyPins.mockResolvedValue(serviceResult);

      const response = await controller.getNearbyPins(99, query);

      expect(pinServiceMock.getNearbyPins).toHaveBeenCalledWith(99, query);

      const result = (response as any).result as NearbyPinResponseDto[];
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NearbyPinResponseDto);
      expect(result[0]).toEqual(
        expect.objectContaining({
          pinId: 1,
          restaurantId: 10,
          primaryImageUrl: 'https://img/A.jpg',
          myReviewContent: '최신 리뷰',
          friendPinCount: 3,
          pinnedAt,
        }),
      );
    });

    it('리뷰가 없고 친구 핀이 없으면 myReviewContent=null, friendPinCount=0 으로 매핑된다', async () => {
      const serviceResult: PinWithRestaurantDto[] = [
        new PinWithRestaurantDto(2, 11, 'B식당', 37.51, 127.01, '서울 서초', null, 2.4, new Date(), null, null, 0),
      ];
      pinServiceMock.getNearbyPins.mockResolvedValue(serviceResult);

      const response = await controller.getNearbyPins(1, query);

      const result = (response as any).result as NearbyPinResponseDto[];
      expect(result[0]).toEqual(
        expect.objectContaining({
          primaryImageUrl: null,
          myReviewContent: null,
          friendPinCount: 0,
        }),
      );
    });
  });
});
