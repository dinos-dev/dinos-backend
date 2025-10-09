import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Friendship } from '@prisma/client';
import { IFriendshipRepository } from 'src/friendship/domain/repository/friendship.repository.interface';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { FriendshipMapper } from '../mapper/friendship.mapper';
import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';
import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';
import { PaginationUtil } from 'src/common/helper/pagination.util';

@Injectable()
export class FriendshipRepository extends PrismaRepository<Friendship> implements IFriendshipRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.friendship, FriendshipMapper.toDomain);
  }

  /**
   * 친구 관계 테이블 생성
   * @param entity FriendshipEntity
   * @returns FriendshipEntity
   */
  async upsertFriendship(entity: FriendshipEntity): Promise<FriendshipEntity> {
    const friendship = await this.model.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: entity.requesterId,
          addresseeId: entity.addresseeId,
        },
      },
      create: {
        requesterId: entity.requesterId,
        addresseeId: entity.addresseeId,
      },
      update: {
        version: { increment: 1 },
      },
    });
    return FriendshipMapper.toDomain(friendship);
  }

  /**
   * 친구 리스트 조회
   * @param entity
   * @param options
   * @returns
   */
  async findAllFriendship(userId: number, options?: PaginationOptions): Promise<PaginatedResult<FriendshipEntity>> {
    if (!options) {
      // 페이징 없이 전체 조회 - User 정보와 Profile 정보 포함
      const friendships = await this.model.findMany({
        where: {
          OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        include: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const friendshipEntities = friendships.map((friendship) => FriendshipMapper.toDomainWithUserInfo(friendship));

      return {
        data: friendshipEntities,
        meta: {
          page: 1,
          limit: friendshipEntities.length, // 실제 데이터 개수
          total: friendshipEntities.length,
          totalPages: 1,
        },
      };
    }

    // 페이징 적용된 조회 - User 정보와 Profile 정보 포함
    const normalizedOptions = PaginationUtil.normalizeOptions(options);

    // 전체 개수 조회
    const total = await this.model.count({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });

    // 페이지네이션 적용된 친구 관계 조회 - User 정보와 Profile 정보 포함
    const friendships = await this.model.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: PaginationUtil.calculateSkip(normalizedOptions.page, normalizedOptions.limit),
      take: normalizedOptions.limit,
    });

    const friendshipEntities = friendships.map((friendship) => FriendshipMapper.toDomainWithUserInfo(friendship));

    return PaginationUtil.createResult(friendshipEntities, normalizedOptions, total);
  }
  // const friendships = await this.model.findMany({
  //   where: {
  //     OR: [{ requesterId: userId }, { addresseeId: userId }],
  //   },
  //   include: {
  //     _count: {
  //       select: {
  //         activities: true,
  //       },
  //     },
  //     requester: {
  //       include: {
  //         profile: true,
  //       },
  //     },
  //     addressee: {
  //       include: {
  //         profile: true,
  //       },
  //     },
  //   },
  //   orderBy: {
  //     createdAt: 'desc',
  //   },
  // });
  // console.log('friendships --->', friendships);
  // const friendList = friendships.map((friendship) => {
  //   const friendInfo = friendship.requesterId === userId ? friendship.addressee : friendship.requester;
  //   return {
  //     id: friendInfo.id,
  //     email: friendInfo.email,
  //     name: friendInfo.name,
  //     count: friendship._count.activities,
  //     profile: friendInfo.profile,
  //   };
  // });
  // return friendList;
  // }
}
