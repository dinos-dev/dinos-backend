import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Pin } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { PinEntity } from 'src/pin/domain/entities/pin.entity';
import { IPinRepository } from 'src/pin/domain/repository/pin.repository.interface';
import { PinMapper } from '../mapper/pin.mapper';

@Injectable()
export class PinRepository extends PrismaRepository<Pin, PinEntity> implements IPinRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.pin);
  }

  /**
   * Create Pin
   * @param pinEntity PinEntity
   * @returns PinEntity
   */
  async create(pinEntity: PinEntity): Promise<PinEntity> {
    const entity = await this.model.create({
      data: {
        userId: pinEntity.userId,
        restaurantId: pinEntity.restaurantId,
        type: pinEntity.type,
      },
    });
    return PinMapper.toDomain(entity);
  }
}
