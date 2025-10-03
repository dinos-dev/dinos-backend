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
}
