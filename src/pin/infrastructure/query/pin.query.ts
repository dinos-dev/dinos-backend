import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Pin, Prisma } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { IPinQuery } from 'src/pin/application/interface/pin-query.interface';
import { PinEntity } from 'src/pin/domain/entities/pin.entity';
import { PinMapper } from '../mapper/pin.mapper';
import { BoundingBoxDto } from 'src/pin/application/dto/bounding-box.dto';
import { LocationQueryOptionsDto } from 'src/pin/application/dto/location-query-options.dto';
import { PinWithRestaurantDto } from 'src/pin/application/dto/pin-with-restaurant.dto';
// import { PinType } from 'src/pin/domain/const/pin.enum';

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

  /**
   * 사용자 위치 기반으로 주변의 핀한 레스토랑 조회
   * @param userId 사용자 ID
   * @param boundingBox 지도 영역 범위
   * @param options 위치 및 쿼리 옵션
   * @returns 거리순으로 정렬된 핀 + 레스토랑 정보
   */
  async findNearbyPinnedRestaurants(
    userId: number,
    boundingBox: BoundingBoxDto,
    options: LocationQueryOptionsDto,
  ): Promise<PinWithRestaurantDto[]> {
    const { minLat, maxLat, minLng, maxLng } = boundingBox;
    const { userLat, userLng, limit } = options;

    // Prisma의 $queryRaw를 사용하여 안전하게 Raw SQL 실행
    const query = Prisma.sql`
      SELECT
        p.id AS pin_id,
        -- p.type AS pin_type,
        p.created_at AS pinned_at,
        r.id AS restaurant_id,
        r.name AS restaurant_name,
        r.latitude,
        r.longitude,
        r.address,
        r.category,
        -- 거리 계산 (Haversine)
        (
          6371 * acos(
            cos(radians(${userLat}))
            * cos(radians(r.latitude))
            * cos(radians(r.longitude) - radians(${userLng}))
            + sin(radians(${userLat}))
            * sin(radians(r.latitude))
          )
        ) AS distance_km

      FROM pins p
      INNER JOIN restaurants r ON p.restaurant_id = r.id

      WHERE
        p.user_id = ${userId}
        AND r.latitude BETWEEN ${minLat} AND ${maxLat}
        AND r.longitude BETWEEN ${minLng} AND ${maxLng}

      ORDER BY distance_km ASC
      LIMIT ${limit};
    `;

    const result: any[] = await this.txHost.tx.$queryRaw(query);

    return result.map(
      (row) =>
        new PinWithRestaurantDto(
          Number(row.pin_id),
          Number(row.restaurant_id),
          row.restaurant_name,
          Number(row.latitude),
          Number(row.longitude),
          row.address,
          row.category,
          Number(row.distance_km),
          // row.pin_type as PinType,
          row.pinned_at,
        ),
    );
  }
}
