import { Injectable } from '@nestjs/common';
import { PlatFormEnumType } from '../../domain/constant/platform.const';
import { ITokenRepository } from '../../domain/repository/token.repository.interface';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Prisma, Token } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { TokenMapper } from '../mapper/token.mapper';

@Injectable()
export class TokenRepository extends PrismaRepository<Token> implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super(prisma, (client) => client.token);
  }

  /**
   * 상태에 따른 리프레시 값 변경
   * @param user User
   * @param refToken refreshToken
   * @param platForm signup Platform
   * @returns
   */
  async updateOrCreateRefToken(
    userEntity: UserEntity,
    refToken: string,
    platForm: PlatFormEnumType,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<TokenEntity> {
    const client = tx ?? this.prisma;
    const userToken = await client.token.findFirst({
      where: { userId: userEntity.id },
    });

    let token;

    if (userToken) {
      token = await client.token.update({
        where: { id: userToken.id },
        data: { refToken },
      });
    } else {
      token = await client.token.create({
        data: {
          userId: userEntity.id,
          refToken,
          platForm,
          expiresAt,
        },
      });
    }

    return TokenMapper.toDomain(token);
  }

  /**
   * delete many token by user id
   * @param userId
   * @param tx
   */
  async deleteManyByUserId(userId: number, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx ?? this.prisma;
    const deleteToken = await client.token.deleteMany({ where: { userId } });
    return deleteToken.count;
  }
}
