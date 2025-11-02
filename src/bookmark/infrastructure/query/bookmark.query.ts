import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { IBookmarkQuery } from 'src/bookmark/application/interface/bookmark-query.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { BookmarkMapper } from '../mapper/bookmark.mapper';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';
import { BOOKMARK_CONSTANTS } from 'src/bookmark/domain/const/bookmark.const';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';
import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';
import { PaginationUtil } from 'src/common/helper/pagination.util';

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
    const normalizedRestaurantId = restaurantRefId ?? BOOKMARK_CONSTANTS.FEED_SENTINEL;

    return await this.model.findUnique({
      where: {
        unique_user_bookmark: {
          userId,
          feedRefId,
          restaurantRefId: normalizedRestaurantId,
        },
      },
    });
  }

  /**
   * 북마크 필터 조회
   * @param userId
   * @param itemType
   * @param options
   * @returns BookmarkEntity[]
   */
  async findFilterBookmark(
    userId: number,
    itemType: ItemType,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<BookmarkEntity>> {
    const whereCondition = {
      userId,
      itemType,
    };

    if (!options) {
      const bookmarks = await this.model.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        data: bookmarks.map((bookmark) => BookmarkMapper.toDomain(bookmark)),
        meta: {
          page: 1,
          limit: bookmarks.length,
          total: bookmarks.length,
          totalPages: 1,
        },
      };
    }

    // 페이징 적용된 조회
    const normalizedOptions = PaginationUtil.normalizeOptions(options);

    const [total, bookmarks] = await Promise.all([
      this.model.count({ where: whereCondition }),
      this.model.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        skip: PaginationUtil.calculateSkip(normalizedOptions.page, normalizedOptions.limit),
        take: normalizedOptions.limit,
      }),
    ]);

    const bookmarkEntities = bookmarks.map((bookmark) => BookmarkMapper.toDomain(bookmark));

    return PaginationUtil.createResult(bookmarkEntities, normalizedOptions, total);
  }
}
