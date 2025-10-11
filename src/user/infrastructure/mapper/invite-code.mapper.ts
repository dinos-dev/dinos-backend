import { InviteCode as InviteCodePrisma, User as UserPrisma } from '@prisma/client';
import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';
import { UserMapper } from './user.mapper';
import { UserEntity } from 'src/user/domain/entities/user.entity';

export class InviteCodeMapper {
  static toDomain(prismaInviteCode: InviteCodePrisma): InviteCodeEntity {
    return new InviteCodeEntity(
      prismaInviteCode.id,
      prismaInviteCode.userId,
      prismaInviteCode.code,
      prismaInviteCode.createdAt,
      prismaInviteCode.updatedAt,
    );
  }

  static toDomainWithUser(prismaInviteCode: InviteCodePrisma & { user: UserPrisma }): InviteCodeEntity {
    return new InviteCodeEntity(
      prismaInviteCode.id,
      prismaInviteCode.userId,
      prismaInviteCode.code,
      prismaInviteCode.createdAt,
      prismaInviteCode.updatedAt,
    );
  }

  // User 정보만 추출 (InviteCodeEntity는 반환하지 않음)
  static extractUserAndProfile(prismaInviteCode: InviteCodePrisma & { user: UserPrisma }): UserEntity {
    return UserMapper.toDomain(prismaInviteCode.user);
  }
}
