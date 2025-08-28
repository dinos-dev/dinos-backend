import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { Prisma, Profile } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { ProfileEntity } from 'src/user/domain/entities/user-profile.entity';
import { ProfileMapper } from '../mapper/user-profile.mapper';

@Injectable()
export class ProfileRepository extends PrismaRepository<Profile> implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super(prisma, (client) => client.profile);
  }

  /**
   * 프로필 생성
   * @param dto
   * @param userId
   * @returns Profile
   */
  async createProfile(entity: ProfileEntity, tx?: Prisma.TransactionClient): Promise<ProfileEntity> {
    const client = tx ?? this.prisma;
    const profile = await client.profile.create({
      data: {
        nickName: entity.nickName,
        comment: entity.comment,
        headerId: entity.headerId,
        bodyId: entity.bodyId,
        headerColor: entity.headerColor,
        bodyColor: entity.bodyColor,
        user: {
          connect: { id: entity.userId },
        },
      },
    });
    return ProfileMapper.toDomain(profile);
  }

  /**
   * 프로필 업데이트
   * @param id profileId
   * @param dto
   * @returns Profile
   */
  async updateById(id: number, entity: ProfileEntity): Promise<ProfileEntity> {
    const profile = await this.prisma.profile.update({
      where: { id },
      data: {
        nickName: entity.nickName,
        comment: entity.comment,
        headerId: entity.headerId,
        bodyId: entity.bodyId,
        headerColor: entity.headerColor,
        bodyColor: entity.bodyColor,
      },
    });

    return ProfileMapper.toDomain(profile);
  }

  /**
   * find profile by user id
   * @param userId
   * @returns Profile | null
   */
  async findByUserId(userId: number): Promise<ProfileEntity | null> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    return profile ? ProfileMapper.toDomain(profile) : null;
  }

  /**
   * delete many profile by user id
   * @param userId
   * @param tx
   */
  async deleteManyByUserId(userId: number, tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
    return await tx.profile.deleteMany({ where: { userId } });
  }
}
