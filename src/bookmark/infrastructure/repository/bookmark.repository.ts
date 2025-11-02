import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Bookmark } from '@prisma/client';
import { IBookmarkRepository } from 'src/bookmark/domain/repository/bookmark.repository.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { BookmarkMapper } from '../mapper/bookmark.mapper';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';

@Injectable()
export class BookmarkRepository extends PrismaRepository<Bookmark, BookmarkEntity> implements IBookmarkRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.bookmark, BookmarkMapper.toDomain);
  }

  //? method override with create method
  async create(bookmarkEntity: BookmarkEntity): Promise<BookmarkEntity> {
    const entity = await this.model.create({
      data: {
        itemType: bookmarkEntity.itemType,
        feedRefId: bookmarkEntity.feedRefId,
        restaurantRefId: bookmarkEntity.restaurantRefId,
        itemName: bookmarkEntity.itemName,
        itemImageUrl: bookmarkEntity.itemImageUrl,
        itemSub: bookmarkEntity.itemSub,
        user: {
          connect: { id: bookmarkEntity.userId },
        },
      },
    });
    return BookmarkMapper.toDomain(entity);
  }
}
