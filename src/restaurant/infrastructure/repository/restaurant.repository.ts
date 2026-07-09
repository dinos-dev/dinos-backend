import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Restaurant } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { RestaurantEntity } from 'src/restaurant/domain/entities/restaurant.entity';
import { IRestaurantRepository } from 'src/restaurant/domain/repository/restaurant.repository.interface';

@Injectable()
export class RestaurantRepository
  extends PrismaRepository<Restaurant, RestaurantEntity>
  implements IRestaurantRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.restaurant);
  }

  /**
   * 가게 존재 여부 확인 (restaurantId 참조 검증용)
   * @param id restaurantId
   * @returns 존재하면 true
   */
  async existsById(id: number): Promise<boolean> {
    const restaurant = await this.model.findUnique({
      where: { id },
      select: { id: true },
    });
    return restaurant !== null;
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
