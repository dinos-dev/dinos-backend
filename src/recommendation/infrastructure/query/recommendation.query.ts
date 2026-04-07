import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IRecommendationQuery } from 'src/recommendation/application/interface/recommendation-query.interface';
import {
  RestaurantSummaryDto,
  SourceUserProfileDto,
} from 'src/recommendation/application/dto/recommended-restaurant.dto';
import { RecommendationItem } from 'src/recommendation/domain/type/recommendation-item.type';

@Injectable()
export class RecommendationQuery implements IRecommendationQuery {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  private get prisma() {
    return this.txHost.tx;
  }

  /**
   * 유저 ID를 기반으로 추천 식당 데이터 조회
   * @param userId 유저 ID
   * @returns 추천 식당 데이터
   */
  async findRawItemsByUserId(userId: number): Promise<RecommendationItem[]> {
    const result = await this.prisma.recommendationResult.findUnique({
      where: { userId },
    });

    if (!result) return [];
    return (result.recommendations as RecommendationItem[]) ?? [];
  }

  /**
   * 식당 ID 목록을 기반으로 식당 요약 정보 조회
   * @param ids 식당 ID 목록
   * @returns 식당 요약 정보
   */
  async findRestaurantSummariesByIds(ids: number[]): Promise<RestaurantSummaryDto[]> {
    if (ids.length === 0) return [];
    return this.prisma.restaurant.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        category: true,
        primaryImageUrl: true,
      },
    });
  }

  /**
   * 사용자 ID 목록을 기반으로 사용자 프로필 정보 조회
   * @param ids 사용자 ID 목록
   * @returns 사용자 프로필 정보
   */
  async findSourceUserProfilesByIds(
    ids: number[],
  ): Promise<{ userId: number; profile: SourceUserProfileDto | null }[]> {
    if (ids.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        profile: {
          select: {
            nickname: true,
            comment: true,
            headerId: true,
            bodyId: true,
            headerColor: true,
            bodyColor: true,
          },
        },
      },
    });

    return users.map((u) => ({ userId: u.id, profile: u.profile ?? null }));
  }
}
