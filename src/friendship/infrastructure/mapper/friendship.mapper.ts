import { Friendship } from '@prisma/client';
import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';

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

  static toDomainWithUserInfo(prismaFriendship: any): FriendshipEntity {
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
