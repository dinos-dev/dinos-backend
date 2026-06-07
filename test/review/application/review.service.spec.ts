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

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: FILE_UPLOAD_SERVICE, useValue: {} },
        { provide: REVIEW_QUESTION_REPOSITORY, useValue: {} },
        { provide: REVIEW_QUERY_REPOSITORY, useValue: {} },
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
});
