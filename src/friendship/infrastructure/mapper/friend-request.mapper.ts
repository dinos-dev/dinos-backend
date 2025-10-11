import { FriendRequest } from '@prisma/client';
import { FriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { UserMapper } from 'src/user/infrastructure/mapper/user.mapper';

export class FriendRequestMapper {
  static toDomain(prismaFriendRequest: FriendRequest): FriendRequestEntity {
    return new FriendRequestEntity(
      prismaFriendRequest.id,
      prismaFriendRequest.senderId,
      prismaFriendRequest.receiverId,
      prismaFriendRequest.status as FriendRequestStatus,
      prismaFriendRequest.respondedAt ? new Date(prismaFriendRequest.respondedAt) : undefined,
      prismaFriendRequest.expiresAt ? new Date(prismaFriendRequest.expiresAt) : undefined,
      prismaFriendRequest.createdAt,
      prismaFriendRequest.updatedAt,
      prismaFriendRequest.version,
      undefined,
      undefined,
    );
  } /**
   * Sender + Profile 함께 조회용
   * @param prismaFriendRequest - Prisma FriendRequest 객체 (sender와 profile 포함)
   * @returns FriendRequestEntity (sender 포함, UserEntity with profile)
   */
  static toDomainWithSenderProfile(prismaFriendRequest: FriendRequest & { sender: UserEntity }): FriendRequestEntity {
    return new FriendRequestEntity(
      prismaFriendRequest.id,
      prismaFriendRequest.senderId,
      prismaFriendRequest.receiverId,
      prismaFriendRequest.status as FriendRequestStatus,
      prismaFriendRequest.respondedAt ? new Date(prismaFriendRequest.respondedAt) : undefined,
      prismaFriendRequest.expiresAt ? new Date(prismaFriendRequest.expiresAt) : undefined,
      prismaFriendRequest.createdAt,
      prismaFriendRequest.updatedAt,
      prismaFriendRequest.version,
      UserMapper.toDomainWithProfile(prismaFriendRequest.sender),
      undefined,
    );
  }
}
