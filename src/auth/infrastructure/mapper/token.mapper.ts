import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { Token as PrismaToken } from '@prisma/client';
import { PlatformEnumType } from 'src/auth/domain/constant/platform.const';

export class TokenMapper {
  static toDomain(prismaToken: PrismaToken): TokenEntity {
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
