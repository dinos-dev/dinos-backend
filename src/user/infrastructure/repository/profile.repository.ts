import { Injectable } from '@nestjs/common';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { Profile } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';
import { ProfileMapper } from '../mapper/profile.mapper';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class ProfileRepository extends PrismaRepository<Profile> implements IProfileRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.profile, ProfileMapper.toDomain);
  }

  /**
   * 프로필 생성
   * @param dto
   * @param userId
   * @returns Profile
   */
  async createProfile(entity: ProfileEntity): Promise<ProfileEntity> {
    const profile = await this.model.create({
      data: {
        nickname: entity.nickname,
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
    const profile = await this.model.update({
      where: { id },
      data: {
        nickname: entity.nickname,
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
    const profile = await this.model.findUnique({ where: { userId } });
    return profile ? ProfileMapper.toDomain(profile) : null;
  }

  /**
   * delete many profile by user id
   * @param userId
   */
  async deleteManyByUserId(userId: number): Promise<number> {
    const deleteProfile = await this.model.deleteMany({ where: { userId } });
    return deleteProfile.count;
  }
}
