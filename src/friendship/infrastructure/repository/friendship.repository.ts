import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Friendship } from '@prisma/client';
import { IFriendshipRepository } from 'src/friendship/domain/repository/friendship.repository.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';

@Injectable()
export class FriendshipRepository extends PrismaRepository<Friendship> implements IFriendshipRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.friendship);
  }
}
