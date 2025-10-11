import { Friendship, Prisma } from '@prisma/client';
import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';

type PrismaFriendshipWithUserAndCount = Prisma.FriendshipGetPayload<{
  include: {
    _count: { select: { activities: true } };
    requester: { include: { profile: true } };
    addressee: { include: { profile: true } };
  };
}>;

export class FriendshipMapper {
  static toDomain(prismaFriendship: Friendship): FriendshipEntity {
    return new FriendshipEntity(
      prismaFriendship.id,
      prismaFriendship.requesterId,
      prismaFriendship.addresseeId,
      prismaFriendship.createdAt,
      prismaFriendship.updatedAt,
      prismaFriendship.version,
    );
  }

  /**
   * @todo any로 강제 타입 캐스팅 제거 해야함
   */
  static toDomainWithUserInfo(prismaFriendship: PrismaFriendshipWithUserAndCount): FriendshipEntity {
    const entity = new FriendshipEntity(
      prismaFriendship.id,
      prismaFriendship.requesterId,
      prismaFriendship.addresseeId,
      prismaFriendship.createdAt,
      prismaFriendship.updatedAt,
      prismaFriendship.version,
    );
    (entity as any).activityCount = prismaFriendship._count.activities;
    (entity as any).requesterInfo = {
      id: prismaFriendship.requester.id,
      email: prismaFriendship.requester.email,
      name: prismaFriendship.requester.name,
      profile: prismaFriendship.requester.profile,
    };
    (entity as any).addresseeInfo = {
      id: prismaFriendship.addressee.id,
      email: prismaFriendship.addressee.email,
      name: prismaFriendship.addressee.name,
      profile: prismaFriendship.addressee.profile,
    };

    return entity;
  }
}
