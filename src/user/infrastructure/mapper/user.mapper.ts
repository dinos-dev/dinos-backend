import { User as PrismaUser, Token as PrismaToken, Provider as PrismaProvider } from '@prisma/client';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { Provider } from 'src/user/domain/const/provider.enum';
import { PlatformEnumType } from 'src/auth/domain/constant/platform.const';

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
      prismaUser.tokens ? prismaUser.tokens.map(UserMapper.tokenToDomain) : [],
    );
  }

  static toPersistence(user: UserEntity): PrismaUser {
    return {
      id: user.id!,
      email: user.email,
      name: user.name,
      password: user.password,
      isActive: user.isActive,
      provider: user.provider as unknown as PrismaProvider,
      providerId: user.providerId,
      createdAt: user.createdAt!,
      updatedAt: user.updatedAt!,
      deletedAt: user.deletedAt,
      version: user.version!,
    };
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
}
