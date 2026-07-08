import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from '../../../src/review/application/review.service';
import {
  FILE_UPLOAD_SERVICE,
  RESTAURANT_REPOSITORY,
  REVIEW_QUERY_REPOSITORY,
  REVIEW_QUESTION_REPOSITORY,
  REVIEW_REPOSITORY,
} from '../../../src/common/config/common.const';
import { WinstonLoggerService } from '../../../src/infrastructure/logger/winston-logger.service';
import { NearbyReviewsQueryDto } from '../../../src/review/presentation/dto/request/nearby-reviews-query.dto';
import { ReviewedRestaurantNearbyDto } from '../../../src/review/application/dto/reviewed-restaurant-nearby.dto';
import { NearbyReviewOptionsDto } from '../../../src/review/application/dto/nearby-review-options.dto';

describe('ReviewService', () => {
  let service: ReviewService;
  const reviewQueryMock = {
    findNearbyReviewedRestaurants: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: FILE_UPLOAD_SERVICE, useValue: {} },
        { provide: REVIEW_QUESTION_REPOSITORY, useValue: {} },
        { provide: REVIEW_QUERY_REPOSITORY, useValue: reviewQueryMock },
        { provide: REVIEW_REPOSITORY, useValue: {} },
        { provide: RESTAURANT_REPOSITORY, useValue: {} },
        { provide: WinstonLoggerService, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNearbyReviewed', () => {
    const baseQuery: NearbyReviewsQueryDto = {
      userLat: 37.5,
      userLng: 127.0,
      minLat: 37.0,
      maxLat: 38.0,
      minLng: 126.0,
      maxLng: 128.0,
      limit: 20,
    };

    it('쿼리 파라미터를 옵션으로 매핑하여 reviewQuery에 위임하고 결과를 그대로 반환한다', async () => {
      const expected: ReviewedRestaurantNearbyDto[] = [
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
          new Date('2026-06-01T10:00:00Z'),
          true,
          new Date('2026-06-02T10:00:00Z'),
          3,
        ),
      ];
      reviewQueryMock.findNearbyReviewedRestaurants.mockResolvedValue(expected);

      const result = await service.getNearbyReviewed(99, baseQuery);

      expect(result).toBe(expected);
      expect(reviewQueryMock.findNearbyReviewedRestaurants).toHaveBeenCalledTimes(1);

      const [userIdArg, optionsArg] = reviewQueryMock.findNearbyReviewedRestaurants.mock.calls[0];
      expect(userIdArg).toBe(99);
      expect(optionsArg).toBeInstanceOf(NearbyReviewOptionsDto);
      expect(optionsArg).toEqual(
        expect.objectContaining({
          userLat: 37.5,
          userLng: 127.0,
          minLat: 37.0,
          maxLat: 38.0,
          minLng: 126.0,
          maxLng: 128.0,
          limit: 20,
        }),
      );
    });

    it('limit 미지정 시 기본값 50을 적용한다', async () => {
      reviewQueryMock.findNearbyReviewedRestaurants.mockResolvedValue([]);
      const queryWithoutLimit = { ...baseQuery };
      delete queryWithoutLimit.limit;

      await service.getNearbyReviewed(1, queryWithoutLimit as NearbyReviewsQueryDto);

      const [, optionsArg] = reviewQueryMock.findNearbyReviewedRestaurants.mock.calls[0];
      expect(optionsArg.limit).toBe(50);
    });

    it('리뷰한 가게가 없으면 빈 배열을 반환한다', async () => {
      reviewQueryMock.findNearbyReviewedRestaurants.mockResolvedValue([]);

      const result = await service.getNearbyReviewed(1, baseQuery);

      expect(result).toEqual([]);
    });
  });
});
