import { Injectable } from '@nestjs/common';
import { PlatFormEnumType } from '../constant/platform.const';
import { ITokenRepository } from '../interface/token.repository.interface';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Prisma, Token, User } from '@prisma/client';

@Injectable()
export class TokenRepository implements ITokenRepository {
  constructor(private readonly prisma: PrismaService) {}

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
  ): Promise<Token> {
    const userToken = await this.prisma.token.findFirst({
      where: { userId: user.id },
    });

    if (userToken) {
      return this.prisma.token.update({
        where: { id: userToken.id },
        data: { refToken },
      });
    } else {
      return this.prisma.token.create({
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
  async deleteManyByUserId(userId: number, tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload> {
    return await tx.token.deleteMany({ where: { userId } });
  }
}
