import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { FriendshipActivity } from '@prisma/client';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IFriendshipActivityRepository } from 'src/friendship/domain/repository/friendship-activity.repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendshipActivityRepository
  extends PrismaRepository<FriendshipActivity>
  implements IFriendshipActivityRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.friendshipActivity);
  }
}
