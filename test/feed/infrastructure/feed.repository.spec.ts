import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import { FeedRepository } from 'src/feed/infrastructure/feed.repository';
import { FeedMapper } from 'src/feed/infrastructure/mapper/feed.mapper';
import { FeedFactory } from '../../__mocks__/feed.factory';
import { FeedDocument } from 'src/feed/infrastructure/feed.schema';

const feedModelMock = {
  find: jest.fn(),
  findById: jest.fn(),
};

describe('FeedRepository', () => {
  let feedRepository: FeedRepository;
  let feedModel: jest.Mocked<Model<FeedDocument>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedRepository,
        {
          provide: getModelToken('Feed'),
          useValue: feedModelMock,
        },
      ],
    }).compile();

    feedRepository = module.get<FeedRepository>(FeedRepository);
    feedModel = module.get(getModelToken('Feed'));
  });

  describe('findByHomeFeeds', () => {
    it('홈 피드에 맞는 데이터를 조회한다', async () => {
      // 1. given
      const id = new Types.ObjectId().toString();
      const feedDoc = FeedFactory.createFeedDocument({ _id: id });
      const mappedFeed = FeedFactory.createFeed({ id });

      // find().lean().exec() 체이닝 모킹
      (feedModel.find as any).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([feedDoc]),
        }),
      });

      const mapperSpy = jest.spyOn(FeedMapper, 'toDomain').mockReturnValue(mappedFeed);

      // 2. when
      const result = await feedRepository.findByHomeFeeds();

      // 3. then
      expect(feedModel.find).toHaveBeenCalledWith({}, { id: 1, title: 1, sections: 1 });
      expect(mapperSpy).toHaveBeenCalledWith(feedDoc);
      expect(result).toEqual([mappedFeed]);
    });
  });

  describe('findAll', () => {
    it('전체 피드 데이터를 조건 없이 조회힌다.', async () => {
      const feedDoc = FeedFactory.createFeedDocument();
      const mappedFeed = FeedFactory.createFeed();

      (feedModel.find as any).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([feedDoc]),
        }),
      });

      jest.spyOn(FeedMapper, 'toDomain').mockReturnValue(mappedFeed);

      const result = await feedRepository.findAll();

      expect(feedModel.find).toHaveBeenCalled();
      expect(result).toEqual([mappedFeed]);
    });
  });

  describe('몽고 Document id 값을 기반으로 피드 정보를 조회한다.', () => {
    const validId = new Types.ObjectId().toString();

    it('요청한 id 파라미터값이 ObjectId의 유효성에 불일치할 경우 Null을 반환한다.', async () => {
      const result = await feedRepository.findById('invalid-id');
      expect(result).toBeNull();
    });

    it('요청한 id 파라미터값이 Document의 ObjectId로 존재할 경우 Document를 반환한다.', async () => {
      const feedDoc = FeedFactory.createFeedDocument({ _id: validId });
      const mappedFeed = FeedFactory.createFeed({ id: validId });

      (feedModel.findById as any).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(feedDoc),
        }),
      });

      jest.spyOn(FeedMapper, 'toDomain').mockReturnValue(mappedFeed);

      const result = await feedRepository.findById(validId);

      expect(feedModel.findById).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mappedFeed);
    });

    it('요청한 id 파라미터값이 Document에 ObjectId로 존재하지 않을 경우 Null을 반환한다', async () => {
      (feedModel.findById as any).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await feedRepository.findById(validId);

      expect(result).toBeNull();
    });
  });
});
