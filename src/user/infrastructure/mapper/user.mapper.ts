import { User as PrismaUser, Token as PrismaToken, Profile } from '@prisma/client';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { Provider } from 'src/user/domain/const/provider.enum';
import { PlatformEnumType } from 'src/auth/domain/constant/platform.const';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser & { tokens?: PrismaToken[] }): UserEntity {
    return new UserEntity(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.password,
      prismaUser.isActive,
      prismaUser.provider as unknown as Provider,
      prismaUser.providerId,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt,
      prismaUser.version,
    );
  }

  private static tokenToDomain(prismaToken: PrismaToken): TokenEntity {
    return new TokenEntity(
      prismaToken.id,
      prismaToken.userId,
      prismaToken.refToken,
      prismaToken.expiresAt,
      prismaToken.platform as unknown as PlatformEnumType,
      prismaToken.createdAt,
      prismaToken.updatedAt,
      prismaToken.version,
    );
  }

  /**
   * User + Tokens 함께 조회용
   * @param prismaUser - Prisma User 객체 (Tokens 포함)
   * @returns UserEntity
   */
  static toDomainWithTokens(prismaUser: PrismaUser & { tokens?: PrismaToken[] }): UserEntity {
    return new UserEntity(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.password,
      prismaUser.isActive,
      prismaUser.provider as unknown as Provider,
      prismaUser.providerId,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt,
      prismaUser.version,
    );
  }

  /**
   * Tokens 정보만 추출
   * @param prismaUser - Prisma User 객체 (Tokens 포함)
   * @returns TokenEntity[]
   */
  static extractTokens(prismaUser: PrismaUser & { tokens?: PrismaToken[] }): TokenEntity[] {
    if (!prismaUser.tokens) return [];

    return prismaUser.tokens.map(
      (token) =>
        new TokenEntity(
          token.id,
          token.userId,
          token.refToken,
          token.expiresAt,
          token.platform as unknown as PlatformEnumType,
          token.createdAt,
          token.updatedAt,
          token.version,
        ),
    );
  }
  /**
   * User + Profile 함께 조회용
   * @param prismaUser - Prisma User 객체 (Profile 포함)
   * @returns UserEntity
   */
  static toDomainWithProfile(prismaUser: PrismaUser & { profile?: Profile }): UserEntity {
    return new UserEntity(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.password,
      prismaUser.isActive,
      prismaUser.provider as unknown as Provider,
      prismaUser.providerId,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt,
      prismaUser.version,
    );
  }

  /**
   * Profile 정보만 추출
   * @param prismaUser - Prisma User 객체 (Profile 포함)
   * @returns ProfileEntity | null
   */
  static extractProfile(prismaUser: PrismaUser & { profile?: Profile }): ProfileEntity | null {
    if (!prismaUser.profile) return null;

    return new ProfileEntity(
      prismaUser.profile.id,
      prismaUser.profile.userId,
      prismaUser.profile.nickname,
      prismaUser.profile.comment,
      prismaUser.profile.headerId,
      prismaUser.profile.bodyId,
      prismaUser.profile.headerColor,
      prismaUser.profile.bodyColor,
      prismaUser.profile.createdAt,
      prismaUser.profile.updatedAt,
      prismaUser.profile.version,
    );
  }
}
