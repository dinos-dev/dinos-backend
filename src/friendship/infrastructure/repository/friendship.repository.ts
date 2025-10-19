import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Friendship } from '@prisma/client';
import { IFriendshipRepository } from 'src/friendship/domain/repository/friendship.repository.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { FriendshipMapper } from '../mapper/friendship.mapper';
import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';

@Injectable()
export class FriendshipRepository extends PrismaRepository<Friendship> implements IFriendshipRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.friendship, FriendshipMapper.toDomain);
  }

  /**
   * 친구 관계 테이블 생성
   * @param entity FriendshipEntity
   * @returns FriendshipEntity
   */
  async upsertFriendship(entity: FriendshipEntity): Promise<FriendshipEntity> {
    const friendship = await this.model.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: entity.requesterId,
          addresseeId: entity.addresseeId,
        },
      },
      create: {
        requesterId: entity.requesterId,
        addresseeId: entity.addresseeId,
      },
      update: {
        version: { increment: 1 },
      },
    });
    return FriendshipMapper.toDomain(friendship);
  }
}
