import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from 'src/domains/user/entities/user.entity';
import { PlatFormEnumType } from '../consts/platform.const';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(private dataSource: DataSource) {
    super(RefreshToken, dataSource.createEntityManager());
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
    let userToken = await qr.manager.findOne(RefreshToken, {
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
    await qr.manager.save(RefreshToken, userToken);
  }
}
