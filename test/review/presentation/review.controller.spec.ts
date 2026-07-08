import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ReviewController } from '../../../src/review/presentation/review.controller';
import { ReviewService } from '../../../src/review/application/review.service';
import { ReviewedRestaurantNearbyDto } from '../../../src/review/application/dto/reviewed-restaurant-nearby.dto';
import { NearbyReviewResponseDto } from '../../../src/review/presentation/dto/response/nearby-reviews.response.dto';
import { NearbyReviewsQueryDto } from '../../../src/review/presentation/dto/request/nearby-reviews-query.dto';

describe('ReviewController', () => {
  let controller: ReviewController;
  const reviewServiceMock = {
    getNearbyReviewed: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: reviewServiceMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNearbyReviewed', () => {
    const query: NearbyReviewsQueryDto = {
      userLat: 37.5,
      userLng: 127.0,
      minLat: 37.0,
      maxLat: 38.0,
      minLng: 126.0,
      maxLng: 128.0,
      limit: 50,
    };

    it('서비스를 호출하고 결과를 응답 DTO로 매핑해 반환한다', async () => {
      const pinnedAt = new Date('2026-06-02T10:00:00Z');
      const lastReviewedAt = new Date('2026-06-01T10:00:00Z');
      const serviceResult: ReviewedRestaurantNearbyDto[] = [
        new ReviewedRestaurantNearbyDto(
          10,
          'A식당',
          37.5,
          127.0,
          '서울 강남',
          '한식',
          'https://img/A.jpg',
          1.2,
          '최신 리뷰',
          lastReviewedAt,
          true,
          pinnedAt,
          3,
        ),
        new ReviewedRestaurantNearbyDto(
          11,
          'B식당',
          37.51,
          127.01,
          '서울 서초',
          '일식',
          null,
          2.4,
          'B 단독 리뷰',
          lastReviewedAt,
          false,
          null,
          0,
        ),
      ];
      reviewServiceMock.getNearbyReviewed.mockResolvedValue(serviceResult);

      const response = await controller.getNearbyReviewed(99, query);

      expect(reviewServiceMock.getNearbyReviewed).toHaveBeenCalledWith(99, query);

      const result = (response as any).result as NearbyReviewResponseDto[];
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(NearbyReviewResponseDto);
      expect(result[0]).toEqual(
        expect.objectContaining({
          restaurantId: 10,
          primaryImageUrl: 'https://img/A.jpg',
          myReviewContent: '최신 리뷰',
          isPinned: true,
          pinnedAt,
          friendPinCount: 3,
        }),
      );
      // 핀하지 않은 가게는 isPinned=false, pinnedAt=null, 친구 핀 없으면 friendPinCount=0
      expect(result[1]).toEqual(
        expect.objectContaining({
          restaurantId: 11,
          primaryImageUrl: null,
          isPinned: false,
          pinnedAt: null,
          friendPinCount: 0,
        }),
      );
    });

    it('빈 결과면 빈 배열을 반환한다', async () => {
      reviewServiceMock.getNearbyReviewed.mockResolvedValue([]);

      const response = await controller.getNearbyReviewed(1, query);

      expect((response as any).result).toEqual([]);
    });
  });
});
