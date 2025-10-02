import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { FriendRequest } from '@prisma/client';
import { IFriendRequestRepository } from 'src/friendship/domain/repository/friend-request.repository.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { FriendRequestMapper } from '../mapper/friend-request.mapper';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';

@Injectable()
export class FriendRequestRepository extends PrismaRepository<FriendRequest> implements IFriendRequestRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.friendRequest);
  }

  /**
   * 친구요청 (상대방이 거절 했을 경우 다시 PENDING 상태로 Upsert)
   * @param entity  FriendRequestEntity
   */
  async upsertRequestFriendInvite(entity: FriendRequestEntity): Promise<FriendRequestEntity> {
    const friendRequest = await this.model.upsert({
      where: {
        senderId_receiverId: {
          senderId: entity.senderId,
          receiverId: entity.receiverId,
        },
      },
      update: {
        status: entity.status,
        version: { increment: 1 },
      },
      create: {
        senderId: entity.senderId,
        receiverId: entity.receiverId,
        status: entity.status,
      },
    });

    return FriendRequestMapper.toDomain(friendRequest);
  }
}
