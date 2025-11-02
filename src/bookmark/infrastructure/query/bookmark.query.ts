import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { IBookmarkQuery } from 'src/bookmark/application/interface/bookmark-query.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { BookmarkMapper } from '../mapper/bookmark.mapper';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';

@Injectable()
export class BookmarkQueryRepository extends PrismaRepository<Bookmark> implements IBookmarkQuery {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.bookmark, BookmarkMapper.toDomain);
  }

  /**
   * Unique Bookmark 조회
   * @param userId
   * @param feedRefId
   * @param restaurantRefId
   * @returns BookmarkEntity | null
   */
  async findByUniqueBookmark(
    userId: number,
    feedRefId: string,
    restaurantRefId?: string | null,
  ): Promise<BookmarkEntity | null> {
    return await this.model.findUnique({
      where: {
        unique_user_bookmark: {
          userId,
          feedRefId,
          restaurantRefId: restaurantRefId || null,
        },
      },
    });
  }
}
