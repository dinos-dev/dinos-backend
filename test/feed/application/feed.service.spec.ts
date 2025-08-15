import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from '../../../src/feed/application/feed.service';
import { IFeedRepository } from '../../../src/feed/domain/repository/feed.repository.interface';
import { FEED_REPOSITORY } from '../../../src/common/config/common.const';
import { FeedFactory } from '../../__mocks__/feed.factory';
import { Feed } from 'src/feed/domain/entities/feed.entity';

describe('FeedService', () => {
  let service: FeedService;
  let repository: jest.Mocked<IFeedRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: FEED_REPOSITORY,
          useValue: {
            findByHomeFeeds: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    repository = module.get(FEED_REPOSITORY);
  });

  describe('findByHomeFeeds', () => {
    it('메인 홈 피드 데이터 조회', async () => {
      const feed = FeedFactory.createFeed();
      repository.findByHomeFeeds.mockResolvedValue([feed]);

      const result = await service.findByHomeFeeds();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Feed);
      expect(repository.findByHomeFeeds).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('전체 피드 데이터 조회', async () => {
      const feed = FeedFactory.createFeed();
      repository.findAll.mockResolvedValue([feed]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Feed);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('파라미터 id값 기반 피드 정보 조회', async () => {
      const feed = FeedFactory.createFeed();
      repository.findById.mockResolvedValue(feed);

      const result = await service.findById('1');
      expect(result).toBeInstanceOf(Feed);
      expect(result?.getId()).toBe('1');
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('파라미터 id값이 잘 못 되었거나, 존재하지 않을 경우 Null 반환', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.findById('1');
      expect(result).toBeNull();
      expect(repository.findById).toHaveBeenCalledWith('1');
    });
  });
});
