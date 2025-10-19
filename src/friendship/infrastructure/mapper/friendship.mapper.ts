import { Friendship, Prisma } from '@prisma/client';
import { FriendWithActivityDto } from 'src/friendship/application/dto/friend-with-activity.dto';
import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';

type FriendshipWithRelations = Prisma.FriendshipGetPayload<{
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
   * Friendship 조회 결과를 DTO 리스트로 매핑
   * @param friendships Prisma 조회 결과 (User, Profile, Activity Count 포함)
   * @param currentUserId 현재 사용자 ID
   * @returns FriendWithActivityDto[]
   */
  static toFriendDtos(friendships: FriendshipWithRelations[], currentUserId: number): FriendWithActivityDto[] {
    return friendships.map((friendship) => {
      // 현재 사용자가 requester인지 addressee인지 판단
      const isRequester = friendship.requesterId === currentUserId;
      const friendUser = isRequester ? friendship.addressee : friendship.requester;

      const profileData = friendUser.profile
        ? {
            nickname: friendUser.profile.nickname,
            comment: friendUser.profile.comment,
            headerId: friendUser.profile.headerId,
            bodyId: friendUser.profile.bodyId,
            headerColor: friendUser.profile.headerColor,
            bodyColor: friendUser.profile.bodyColor,
          }
        : null;

      return FriendWithActivityDto.create({
        id: friendship.id,
        friendUserId: friendUser.id,
        email: friendUser.email,
        name: friendUser.name,
        friendProfileData: profileData,
        activityCount: friendship._count.activities,
        createdAt: friendship.createdAt,
      });
    });
  }
}
