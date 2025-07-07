import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { Prisma, Profile } from '@prisma/client';
import { CreateUserProfileDto } from 'src/user/presentation/dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from 'src/user/presentation/dto/request/update-user-profile.dto';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';

@Injectable()
export class ProfileRepository extends PrismaRepository<Profile> implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super(prisma, (client) => client.profile);
  }

  /**
   * @todo 추후 prisma 기본 메서드는 BaseRepository로 추상화 예정
   *
   * id 기반 프로필 조회
   * @param id profileId
   * @returns Profile
   */
  async findById(id: number): Promise<Profile> {
    return this.prisma.profile.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * userId 기반 프로필 조회
   * @param userId
   * @returns Profile
   */
  async findByUserId(userId: number): Promise<Profile> {
    return this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });
  }

  /**
   * @todo 추후 prisma 기본 메서드는 BaseRepository로 추상화 예정
   *
   * 프로필 생성
   * @param dto
   * @param userId
   * @returns Profile
   */
  async createProfile(dto: CreateUserProfileDto, userId: number): Promise<Profile> {
    return this.prisma.profile.create({
      data: {
        userId,
        nickName: dto.nickName,
        comment: dto.comment,
        headerId: dto.headerId,
        bodyId: dto.bodyId,
        headerColor: dto.headerColor,
        bodyColor: dto.bodyColor,
      },
    });
  }

  /**
   * @todo 추후 prisma 기본 메서드는 BaseRepository로 추상화 예정
   *
   * 프로필 업데이트
   * @param id profileId
   * @param dto
   * @returns Profile
   */
  async update(id: number, dto: UpdateUserProfileDto): Promise<Profile> {
    return this.prisma.profile.update({
      where: { id },
      data: {
        nickName: dto.nickName,
        comment: dto.comment,
        headerId: dto.headerId,
        bodyId: dto.bodyId,
        headerColor: dto.headerColor,
        bodyColor: dto.bodyColor,
      },
    });
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
