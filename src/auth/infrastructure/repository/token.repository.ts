import { Injectable } from '@nestjs/common';
import { PlatformEnumType } from '../../domain/constant/platform.const';
import { ITokenRepository } from '../../domain/repository/token.repository.interface';
import { Token } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { TokenMapper } from '../mapper/token.mapper';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class TokenRepository extends PrismaRepository<Token> implements ITokenRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.token, TokenMapper.toDomain);
  }

  /**
   * 상태에 따른 리프레시 값 변경
   * @param user User
   * @param refToken refreshToken
   * @param platform signup platform
   * @returns
   */
  async updateOrCreateRefToken(
    userEntity: UserEntity,
    refToken: string,
    platform: PlatformEnumType,
    expiresAt: Date,
  ): Promise<TokenEntity> {
    const userToken = await this.model.findFirst({
      where: { userId: userEntity.id },
    });

    let token;

    if (userToken) {
      token = await this.model.update({
        where: { id: userToken.id },
        data: { refToken },
      });
    } else {
      token = await this.model.create({
        data: {
          userId: userEntity.id,
          refToken,
          platform,
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
  async deleteManyByUserId(userId: number): Promise<number> {
    const deleteToken = await this.model.deleteMany({ where: { userId } });
    return deleteToken.count;
  }
}
