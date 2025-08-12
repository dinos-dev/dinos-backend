import { Feed } from '../entities/feed.entity';

export interface IFeedRepository {
  findByHomeFeeds(): Promise<Feed[]>;
  findAll(): Promise<Feed[]>;
  findById(id: string): Promise<Feed | null>;
}
