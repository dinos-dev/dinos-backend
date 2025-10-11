import { Profile as ProfilePrisma } from '@prisma/client';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';

export class ProfileMapper {
  static toDomain(prismaProfile: ProfilePrisma): ProfileEntity {
    return new ProfileEntity(
      prismaProfile.id,
      prismaProfile.userId,
      prismaProfile.nickname,
      prismaProfile.comment,
      prismaProfile.headerId,
      prismaProfile.bodyId,
      prismaProfile.headerColor,
      prismaProfile.bodyColor,
      prismaProfile.createdAt,
      prismaProfile.updatedAt,
      prismaProfile.version,
    );
  }
}
