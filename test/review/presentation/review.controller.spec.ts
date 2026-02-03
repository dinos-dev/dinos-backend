import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from '../../../src/review/presentation/review.controller';
import { ReviewService } from '../../../src/review/application/review.service';

describe('ReviewController', () => {
  let controller: ReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [ReviewService],
    }).compile();

    controller = module.get<ReviewController>(ReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
