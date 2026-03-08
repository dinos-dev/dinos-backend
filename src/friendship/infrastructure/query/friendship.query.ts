import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Friendship } from '@prisma/client';
import { IFriendshipQuery } from 'src/friendship/application/interface/friendship-query.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { FriendshipMapper } from '../mapper/friendship.mapper';
import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';
import { PaginationUtil } from 'src/common/helper/pagination.util';
import { FriendWithActivityDto } from 'src/friendship/application/dto/friend-with-activity.dto';
import { SharedPinFriendProfileDto, SharedPinItemDto } from 'src/friendship/application/dto/shared-pins.dto';

@Injectable()
export class FriendshipQueryRepository extends PrismaRepository<Friendship> implements IFriendshipQuery {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.friendship, FriendshipMapper.toDomain);
  }
  /**
   * 친구 리스트 조회
   * @param entity
   * @param options
   * @returns PaginatedResult<FriendWithActivityDto>
   */
  async findAllFriendship(
    userId: number,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<FriendWithActivityDto>> {
    const whereCondition = {
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    };

    const includeCondition = {
      _count: {
        select: {
          activities: true,
        },
      },
      requester: {
        include: {
          profile: true,
        },
      },
      addressee: {
        include: {
          profile: true,
        },
      },
    };

    if (!options) {
      // 페이징 없이 전체 조회
      const friendships = await this.prisma.friendship.findMany({
        where: whereCondition,
        include: includeCondition,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const friendDtos = FriendshipMapper.toFriendDtos(friendships, userId);

      return {
        data: friendDtos,
        meta: {
          page: 1,
          limit: friendDtos.length,
          total: friendDtos.length,
          totalPages: 1,
        },
      };
    }

    // 페이징 적용된 조회
    const normalizedOptions = PaginationUtil.normalizeOptions(options);

    const [total, friendships] = await Promise.all([
      this.prisma.friendship.count({ where: whereCondition }),
      this.prisma.friendship.findMany({
        where: whereCondition,
        include: includeCondition,
        orderBy: {
          createdAt: 'desc',
        },
        skip: PaginationUtil.calculateSkip(normalizedOptions.page, normalizedOptions.limit),
        take: normalizedOptions.limit,
      }),
    ]);

    const friendDtos = FriendshipMapper.toFriendDtos(friendships, userId);

    return PaginationUtil.createResult(friendDtos, normalizedOptions, total);
  }

  /**
   * 내가 pin한 음식점 중 나와 친구인 사용자도 pin한 데이터를 flat하게 조회
   * @param userId 현재 사용자 ID
   * @returns (음식점, 친구) 조합 단위의 flat 목록
   */
  async findSharedPins(userId: number): Promise<SharedPinItemDto[]> {
    /**
     * @see
     * 추후 Slow 경우 Raw 하게 UNION으로 처리해야 Index 확실하게 탈 수 있음.
     * 일단 PRISMA 레이어로 처리하구 추후 성능 이슈시 Raw 하게 UNION 으로 처리
     */
    const pins = await this.prisma.pin.findMany({
      where: { userId },
      include: {
        restaurant: {
          include: {
            pins: {
              where: {
                userId: { not: userId },
                user: {
                  OR: [
                    { friendshipsAsRequester: { some: { addresseeId: userId } } },
                    { friendshipsAsAddressee: { some: { requesterId: userId } } },
                  ],
                },
              },
              include: {
                user: { include: { profile: true } },
              },
            },
          },
        },
      },
    });

    const result: SharedPinItemDto[] = [];

    for (const pin of pins) {
      // 나와 동일한 음식점을 pin한 친구 목록 순회
      for (const friendPin of pin.restaurant.pins) {
        const profile = friendPin.user.profile
          ? new SharedPinFriendProfileDto(
              friendPin.user.profile.nickname,
              friendPin.user.profile.comment,
              friendPin.user.profile.headerId,
              friendPin.user.profile.bodyId,
              friendPin.user.profile.headerColor,
              friendPin.user.profile.bodyColor,
            )
          : null;

        result.push(
          new SharedPinItemDto(
            pin.restaurant.id,
            pin.restaurant.name,
            pin.restaurant.address,
            pin.restaurant.category,
            pin.restaurant.latitude,
            pin.restaurant.longitude,
            pin.restaurant.primaryImageUrl,
            friendPin.user.id,
            profile,
          ),
        );
      }
    }

    return result;
  }
}
