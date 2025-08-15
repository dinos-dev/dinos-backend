import { Test, TestingModule } from '@nestjs/testing';
import { FeedController } from '../../../src/feed/presentation/feed.controller';
import { FeedService } from '../../../src/feed/application/feed.service';
import { FeedFactory } from '../../__mocks__/feed.factory';
import { HttpResponse } from '../../../src/common/http/http-response';
import { NotFoundException } from '@nestjs/common';
import { HttpFeedErrorConstants } from '../../../src/feed/application/helper/http-error-object';

describe('FeedController', () => {
  let controller: FeedController;
  let service: jest.Mocked<FeedService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        {
          provide: FeedService,
          useValue: {
            findByHomeFeeds: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FeedController>(FeedController);
    service = module.get(FeedService);
  });

  describe('findAll', () => {
    it('전체 피드 데이터를 반환한다.', async () => {
      const feed = FeedFactory.createFeed();
      service.findAll.mockResolvedValue([feed]);

      const result = await controller.findAll();
      expect(result).toBeInstanceOf(HttpResponse);
      //   expect(result.data).toHaveLength(1);
      //   expect(result.data[0]).toBeInstanceOf(FeedResponseDto);
      //   expect(result.data[0].title).toBe('Test Feed');
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByHomeFeeds', () => {
    it('홈 피드 데이터를 반환한다.', async () => {
      const feed = FeedFactory.createFeed();
      service.findByHomeFeeds.mockResolvedValue([feed]);

      const result = await controller.findByHomeFeeds();
      expect(result).toBeInstanceOf(HttpResponse);
      //   expect(result.data).toHaveLength(1);
      //   expect(result.data[0]).toBeInstanceOf(HomeFeedResponseDto);
      //   expect(result.data[0].title).toBe('Test Feed');
      expect(service.findByHomeFeeds).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('파라미터 id 값 기반 피드 데이터를 반환한다.', async () => {
      const feed = FeedFactory.createFeed();
      service.findById.mockResolvedValue(feed);

      const result = await controller.findById('1');
      expect(result).toBeInstanceOf(HttpResponse);
      //   expect(result.data).toBeInstanceOf(FeedResponseDto);
      //   expect(result.data.title).toBe('Test Feed');
      expect(service.findById).toHaveBeenCalledWith('1');
    });

    it('파라미터 id값 기반 피드 데이터가 존재하지 않을경우 NotFound Exception을 반환한다.', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.findById('1')).rejects.toThrow(
        new NotFoundException(HttpFeedErrorConstants.NOT_FOUND_FEED_BY_ID),
      );
      expect(service.findById).toHaveBeenCalledWith('1');
    });
  });
});
