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
}
