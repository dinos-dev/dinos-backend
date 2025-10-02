import { Injectable } from '@nestjs/common';

import { hashPassword } from 'src/common/helper/password.util';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { User } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { UserMapper } from '../mapper/user.mapper';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';

@Injectable()
export class UserRepository extends PrismaRepository<User> implements IUserRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    // TransactionHost와 모델 접근 함수를 부모 클래스에 전달
    super(txHost, (client) => client.user);
  }
  /**
   * 로컬 가입시 이메일 검증
   * @param email
   * @returns boolean
   */
  async existByEmail(email: string): Promise<boolean> {
    const user = await this.model.findUnique({ where: { email } });
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
  async findOrCreateSocialUser(entity: UserEntity): Promise<{ user: UserEntity; isNew: boolean }> {
    const user = await this.model.findUnique({
      where: { email: entity.email },
    });

    if (user) return { user: UserMapper.toDomain(user), isNew: false };

    const newUser = await this.model.create({
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
  async findAllRefToken(userId: number): Promise<{ user: UserEntity; tokens: TokenEntity[] }> {
    const userByToken = await this.model.findUnique({
      where: { id: userId },
      include: { tokens: true },
    });

    // Mapper에서 순수 Entity로 변환
    const user = UserMapper.toDomainWithTokens(userByToken);
    const tokens = UserMapper.extractTokens(userByToken);

    return { user, tokens };
  }

  /**
   * payLoad sub based user find
   * @param userId
   * @returns User & { profile: Profile }
   */
  async findUserWithProfileById(userId: number): Promise<User> {
    return await this.model.findUnique({
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
  async findOrCreateLocalUser(entity: UserEntity): Promise<{ user: UserEntity; isNew: boolean }> {
    const user = await this.model.findUnique({
      where: {
        email: entity.email,
      },
    });
    if (user) return { user: UserMapper.toDomain(user), isNew: false };

    const newUser = await this.model.create({
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
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.model.findUnique({ where: { email } });

    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  /**
   * withdraw user by soft delete using transaction
   * @param userId
   * @returns
   */
  async softDeleteUserInTransaction(userId: number): Promise<UserEntity> {
    const user = await this.model.update({ where: { id: userId }, data: { deletedAt: new Date() } });
    return UserMapper.toDomain(user);
  }

  /**
   * findByUserId
   * @param id
   * @returns UserEntity | null
   */
  async findByUserId(id: number): Promise<UserEntity | null> {
    const user = await this.model.findUnique({ where: { id } });

    if (!user) return null;
    return UserMapper.toDomain(user);
  }

  /**
   * user id based delete
   * @param id
   * @returns deleted userId
   */
  async deleteByUser(id: number): Promise<number> {
    const user = await this.model.delete({ where: { id } });

    return user.id;
  }

  /**
   * findByUserProfile
   * @param userId
   * @returns UserEntity | null
   */
  async findByUserProfile(userId: number): Promise<{ user: UserEntity; profile: ProfileEntity }> {
    const findUserByProfile = await this.model.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    console.log('findUserByProfile', findUserByProfile);

    const user = UserMapper.toDomainWithProfile(findUserByProfile);
    const profile = UserMapper.extractProfile(findUserByProfile);

    return { user, profile };
  }
}
