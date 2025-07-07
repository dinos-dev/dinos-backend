import { Injectable } from '@nestjs/common';
import { PlatFormEnumType } from '../../domain/constant/platform.const';
import { ITokenRepository } from '../../domain/repository/token.repository.interface';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Prisma, Token, User } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';

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
    user: User,
    refToken: string,
    platForm: PlatFormEnumType,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<Token> {
    const client = tx ?? this.prisma;
    const userToken = await client.token.findFirst({
      where: { userId: user.id },
    });

    if (userToken) {
      return client.token.update({
        where: { id: userToken.id },
        data: { refToken },
      });
    } else {
      return client.token.create({
        data: {
          userId: user.id,
          refToken,
          platForm,
          expiresAt,
        },
      });
    }
  }

  /**
   * delete many token by user id
   * @param userId
   * @param tx
   */
  async deleteManyByUserId(userId: number, tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
    const client = tx ?? this.prisma;
    return await client.token.deleteMany({ where: { userId } });
  }
}
