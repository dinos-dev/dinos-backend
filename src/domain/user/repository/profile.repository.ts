import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { IProfileRepository } from '../interface/profile.repository.interface';
import { Profile } from '@prisma/client';
import { CreateUserProfileDto } from '../dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/request/update-user-profile.dto';

@Injectable()
export class ProfileRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(dto: CreateUserProfileDto, userId: number): Promise<Profile> {
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
}
