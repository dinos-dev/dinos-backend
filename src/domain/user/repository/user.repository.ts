import { Injectable } from '@nestjs/common';

import { SocialUserDto } from '../dto/request/social-user.dto';
import { CreateUserDto } from '../dto/request/create-user.dto';
import { hashPassword } from 'src/core/helper/password.util';
import { IUserRepository } from '../interface/user.repository.interface';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 로컬 가입시 이메일 검증
   * @param email
   * @returns boolean
   */
  async existByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  /**
   * 이메일 & 인증타입에 따른 가입여부 체크
   * @param email
   * @returns boolean
   */
  async existByEmailAndAuthType(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  /**
   * FindOne OR Create Social User
   * @param dto SocialUserDto
   * @returns user
   */
  async findOrCreateSocialUser(dto: SocialUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) return user;

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        provider: dto.provider,
        providerId: dto.providerId,
      },
    });
  }

  /**
   * get ref-token by user
   * @param userId
   * @returns User
   */
  async findAllRefToken(userId: number): Promise<Prisma.UserGetPayload<{ include: { tokens: true } }> | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { tokens: true },
    });
  }

  /**
   * payLoad sub based user find
   * @param userId
   * @returns User
   */
  async findById(userId: number): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
      },
    });
  }

  /**
   * FindOne OR Create Local User
   * @param dto CreateUserDto
   * @returns
   */
  async findOrCreateLocalUser(dto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) return user;

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashPassword(dto.password),
      },
    });
  }
}
