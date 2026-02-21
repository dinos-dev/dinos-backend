import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Restaurant } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { RestaurantEntity } from 'src/restaurant/domain/entities/restaurant.entity';
import { IRestaurantRepository } from 'src/restaurant/domain/repository/restaurant.repository.interface';
import { RestaurantMapper } from '../mapper/restaurant.mapper';

@Injectable()
export class RestaurantRepository
  extends PrismaRepository<Restaurant, RestaurantEntity>
  implements IRestaurantRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.restaurant);
  }

  /**
   * 네이버 refPlaceId 기반 restaurant 정보 동기화
   * @param entity RestaurantEntity
   * @returns RestaurantEntity
   */
  async upsertRestaurantByNameAndAddress(entity: RestaurantEntity): Promise<RestaurantEntity> {
    const restaurant = await this.model.upsert({
      where: { unique_name_address: { name: entity.name, address: entity.address } },
      update: {
        name: entity.name,
        address: entity.address,
        latitude: entity.latitude,
        longitude: entity.longitude,
        lastSyncedAt: entity.lastSyncedAt,
        isActive: entity.isActive,
      },
      create: {
        name: entity.name,
        address: entity.address,
        latitude: entity.latitude,
        longitude: entity.longitude,
        lastSyncedAt: entity.lastSyncedAt,
        isActive: entity.isActive,
        category: entity.category,
      },
    });
    return RestaurantMapper.toDomain(restaurant);
  }

  /**
   * Restaurant 대표 이미지 업데이트 (미설정 상태인 경우에만)
   * primaryImageSetBy가 null인 경우에만 업데이트 → 최초 리뷰어 이미지 채택
   * @param restaurantId number
   * @param imageUrl string
   * @param userId number
   */
  async updatePrimaryImageIfNotSet(restaurantId: number, imageUrl: string, userId: number): Promise<void> {
    await this.model.updateMany({
      where: { id: restaurantId, primaryImageSetBy: null },
      data: { primaryImageUrl: imageUrl, primaryImageSetBy: userId },
    });
  }
}
