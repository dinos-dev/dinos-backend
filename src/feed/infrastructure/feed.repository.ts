import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IFeedRepository } from '../domain/repository/feed.repository.interface';
import { Feed } from '../domain/entities/feed.entity';
import { FeedDocument } from './feed.schema';
import { FeedMapper } from './mapper/feed.mapper';

@Injectable()
export class FeedRepository implements IFeedRepository {
  constructor(@InjectModel('Feed') private feedModel: Model<FeedDocument>) {}

  //? 홈 피드 조회
  async findByHomeFeeds(): Promise<Feed[]> {
    const docs = await this.feedModel.find({}, { id: 1, title: 1, sections: 1 }).lean().exec();
    return docs.map((doc) => FeedMapper.toDomain(doc));
  }

  //? 전체 피드 조회
  async findAll(): Promise<Feed[]> {
    const docs = await this.feedModel.find().lean().exec();
    return docs.map((doc) => FeedMapper.toDomain(doc));
  }

  /**
   * 특정 피드 상세 조회
   * @param id - 피드 ID
   */
  async findById(id: string): Promise<Feed | null> {
    // MongoDB ObjectId의 유효성 Id값이 불일치 할 경우 null 핸들링
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await this.feedModel.findById(id).lean().exec();
    return doc ? FeedMapper.toDomain(doc) : null;
  }
}
