import { Injectable } from '@nestjs/common';

import { SocialUserDto } from 'src/user/presentation/dto/request/social-user.dto';
import { CreateUserDto } from 'src/user/presentation/dto/request/create-user.dto';
import { hashPassword } from 'src/common/helper/password.util';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';

@Injectable()
export class UserRepository extends PrismaRepository<User> implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super(prisma, (client) => client.user);
  }

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
  async findOrCreateSocialUser(dto: SocialUserDto, tx?: Prisma.TransactionClient): Promise<User> {
    const client = tx ?? this.prisma;
    const user = await client.user.findUnique({
      where: { email: dto.email },
    });

    if (user) return user;

    return client.user.create({
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
  async findOrCreateLocalUser(dto: CreateUserDto, tx?: Prisma.TransactionClient): Promise<User> {
    const client = tx ?? this.prisma;
    const user = await client.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) return user;

    return client.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashPassword(dto.password),
      },
    });
  }

  /**
   * withdraw user by soft delete using transaction
   * @param userId
   * @param tx
   * @returns
   */
  async softDeleteUserInTransaction(userId: number, tx: Prisma.TransactionClient): Promise<User> {
    return await tx.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  }
}
