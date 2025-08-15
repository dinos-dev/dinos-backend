import { Inject, Injectable } from '@nestjs/common';
import { IFeedRepository } from '../domain/repository/feed.repository.interface';
import { Feed } from '../domain/entities/feed.entity';
import { FEED_REPOSITORY } from 'src/common/config/common.const';

@Injectable()
export class FeedService {
  constructor(
    @Inject(FEED_REPOSITORY)
    private readonly feedRepository: IFeedRepository,
  ) {}

  /** 메인 홈 피드 조회 */
  async findByHomeFeeds(): Promise<Feed[]> {
    return await this.feedRepository.findByHomeFeeds();
  }

  /** 전체 피드 컬렉션 조회 -> Admin에서 적용 */
  async findAll(): Promise<Feed[]> {
    return await this.feedRepository.findAll();
  }

  /**
   * ID기반 상세 조회
   * @param id Document ID
   * @return Feed
   */
  async findById(id: string): Promise<Feed | null> {
    return await this.feedRepository.findById(id);
  }
}
