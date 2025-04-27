import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { User } from 'src/domain/user/entities/user.entity';
import { PlatFormEnumType } from '../helper/platform.const';

@Injectable()
export class RefreshTokenRepository extends Repository<Token> {
  constructor(private dataSource: DataSource) {
    super(Token, dataSource.createEntityManager());
  }

  /**
   * 상태에 따른 리프레시 값 변경
   * @param user User
   * @param refToken refreshToken
   * @param platForm signup Platform
   * @param qr QueryRunner
   * @returns
   */
  async updateOrCreateRefToken(user: User, refToken: string, platForm: PlatFormEnumType, qr: QueryRunner) {
    let userToken = await qr.manager.findOne(Token, {
      where: {
        user,
      },
    });

    if (userToken) {
      userToken.refToken = refToken;
    } else {
      userToken = this.create({
        refToken,
        user,
        platForm,
      });
    }
    await qr.manager.save(Token, userToken);
  }
}
