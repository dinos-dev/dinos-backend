import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Pin } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { IPinQuery } from 'src/pin/application/interface/pin-query.interface';
import { PinEntity } from 'src/pin/domain/entities/pin.entity';
import { PinMapper } from '../mapper/pin.mapper';

@Injectable()
export class PinQuery extends PrismaRepository<Pin, PinEntity> implements IPinQuery {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.pin);
  }

  /**
   * FindPin By UserId And RestaurantId
   * @param UserId
   * @param RestaurantId
   * @returns PinEntity | null
   */
  async findByUserIdAndRestaurantId(userId: number, restaurantId: number): Promise<PinEntity | null> {
    const entity = await this.model.findUnique({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });
    return entity ? PinMapper.toDomain(entity) : null;
  }
}
