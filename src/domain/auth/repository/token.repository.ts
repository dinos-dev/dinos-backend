import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/user/entities/user.entity';
import { PlatFormEnumType } from '../helper/platform.const';

@Injectable()
export class TokenRepository extends Repository<Token> {
  constructor(
    @InjectRepository(Token)
    private readonly repository: Repository<Token>,
  ) {
    super(Token, repository.manager, repository.queryRunner);
  }

  /**
   * 상태에 따른 리프레시 값 변경
   * @param user User
   * @param refToken refreshToken
   * @param platForm signup Platform
   * @returns
   */
  async updateOrCreateRefToken(user: User, refToken: string, platForm: PlatFormEnumType) {
    let userToken = await this.findOne({
      relations: ['user'],
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
    await this.manager.save(Token, userToken);
  }
}
