import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RestaurantSearchQuery } from 'src/restaurant/application/dto/restaurant-search.query';
import { RestaurantSearchResult } from 'src/restaurant/application/dto/restaurant-search.result';
import { IRestaurantSearchQuery } from 'src/restaurant/application/interface/restaurant-search-query.interface';

@Injectable()
export class RestaurantSearchQueryHandler implements IRestaurantSearchQuery {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  /**
   * 사용자 좌표 주변 음식점명 검색
   * - 반경의 외접 bbox(latitude/longitude BETWEEN)로 리소스를 선필터해 후보를 좁힌다.
   * - 좁혀진 후보에 식당명 ILIKE 부분일치를 적용한다.
   *   (idx_restaurants_name_trgm 활용)
   * @param query 기준 좌표 + 반경 + 키워드 + 조회 개수 제한
   * @returns 거리순 검색 결과
   */
  async searchNearby(query: RestaurantSearchQuery): Promise<RestaurantSearchResult[]> {
    const { latitude, longitude, radiusMeters, minLat, maxLat, minLng, maxLng, keyword, limit } = query;
    const escapedKeyword = this.escapeLikePattern(keyword);
    const pattern = `%${escapedKeyword}%`;
    const prefixPattern = `${escapedKeyword}%`;
    const radiusKm = radiusMeters / 1000;

    const sql = Prisma.sql`
      WITH candidates AS (
        SELECT
          r.id,
          r.name,
          r.address,
          r.latitude,
          r.longitude,
          r.category,
          r.primary_image_url,
          (
            6371 * acos(
              LEAST(1, GREATEST(-1,
                cos(radians(${latitude}))
                * cos(radians(r.latitude))
                * cos(radians(r.longitude) - radians(${longitude}))
                + sin(radians(${latitude}))
                * sin(radians(r.latitude))
              ))
            )
          ) AS distance_km
        FROM restaurants r
        WHERE
          r.is_active = true
          AND r.latitude BETWEEN ${minLat} AND ${maxLat}
          AND r.longitude BETWEEN ${minLng} AND ${maxLng}
          AND r.name ILIKE ${pattern} ESCAPE '!'
      )
      SELECT *
      FROM candidates c
      WHERE c.distance_km <= ${radiusKm}
      ORDER BY
        CASE
          WHEN lower(c.name) = lower(${keyword}) THEN 0
          WHEN c.name ILIKE ${prefixPattern} ESCAPE '!' THEN 1
          ELSE 2
        END ASC,
        c.distance_km ASC,
        c.name ASC
      LIMIT ${limit};
    `;

    const rows = await this.txHost.tx.$queryRaw<RestaurantSearchRow[]>(sql);

    return rows.map(
      (row) =>
        new RestaurantSearchResult(
          Number(row.id),
          row.name,
          row.address,
          Number(row.latitude),
          Number(row.longitude),
          row.category,
          row.primary_image_url,
          Number(row.distance_km),
        ),
    );
  }

  private escapeLikePattern(keyword: string): string {
    return keyword.replace(/[!%_]/g, (value) => `!${value}`);
  }
}

type RestaurantSearchRow = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string | null;
  primary_image_url: string | null;
  distance_km: number;
};
