import { Injectable } from '@nestjs/common';

import { hashPassword } from 'src/common/helper/password.util';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { UserMapper } from '../mapper/user.mapper';

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
  async findOrCreateSocialUser(
    entity: UserEntity,
    tx?: Prisma.TransactionClient,
  ): Promise<{ user: UserEntity; isNew: boolean }> {
    const client = tx ?? this.prisma;

    const user = await client.user.findUnique({
      where: { email: entity.email },
    });

    if (user) return { user: UserMapper.toDomain(user), isNew: false };

    const newUser = await client.user.create({
      data: {
        email: entity.email,
        name: entity.name,
        provider: entity.provider,
        providerId: entity.providerId,
      },
    });

    return { user: UserMapper.toDomain(newUser), isNew: true };
  }

  /**
   * get ref-token by user
   * @param userId
   * @returns User
   */
  async findAllRefToken(userId: number): Promise<UserEntity | null> {
    const userByToken = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tokens: true },
    });

    return UserMapper.toDomain(userByToken);
  }

  /**
   * payLoad sub based user find
   * @param userId
   * @returns User & { profile: Profile }
   */
  async findUserWithProfileById(userId: number): Promise<User> {
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
  async findOrCreateLocalUser(
    entity: UserEntity,
    tx?: Prisma.TransactionClient,
  ): Promise<{ user: UserEntity; isNew: boolean }> {
    const client = tx ?? this.prisma;
    const user = await client.user.findUnique({
      where: {
        email: entity.email,
      },
    });
    if (user) return { user: UserMapper.toDomain(user), isNew: false };

    const newUser = await client.user.create({
      data: {
        email: entity.email,
        name: entity.name,
        password: hashPassword(entity.password),
      },
    });

    return { user: UserMapper.toDomain(newUser), isNew: true };
  }

  /**
   * findByEmail
   * @param email
   * @param tx
   */
  async findByEmail(email: string, tx: Prisma.TransactionClient): Promise<UserEntity | null> {
    const client = tx ?? this.prisma;
    const user = await client.user.findUnique({ where: { email } });

    if (!user) return null;
    return UserMapper.toDomain(user);
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

  /**
   * findByUserId
   * @param id
   * @returns UserEntity | null
   */
  async findByUserId(id: number): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  /**
   * user id based delete
   * @param id
   * @param tx
   * @returns deleted userId
   */
  async deleteByUser(id: number, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx ?? this.prisma;
    const user = await client.user.delete({ where: { id } });

    return user.id;
  }
}
