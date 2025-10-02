import { FriendRequest } from '@prisma/client';
import { FriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';

export class FriendRequestMapper {
  static toDomain(prismaFriendRequest: FriendRequest): FriendRequestEntity {
    return new FriendRequestEntity(
      prismaFriendRequest.id,
      prismaFriendRequest.senderId,
      prismaFriendRequest.receiverId,
      prismaFriendRequest.status as FriendRequestStatus,
      prismaFriendRequest.createdAt,
      prismaFriendRequest.updatedAt,
      prismaFriendRequest.version,
    );
  }
}
