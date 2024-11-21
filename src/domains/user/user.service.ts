import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { TokenPayLoad } from '../auth/interfaces/token-payload.interface';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { DataSource } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly confgiService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 회원탈퇴
   * @param payLoad
   * @returns
   */
  async withdrawUser(payLoad: TokenPayLoad): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      await qr.manager.softDelete(User, {
        id: payLoad.sub,
      });
      await qr.manager.update(
        User,
        {
          id: payLoad.sub,
        },
        {
          isActive: false,
        },
      );
      await qr.manager.delete(RefreshToken, {
        user: { id: payLoad.sub },
      });
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      console.log('error->', err);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    } finally {
      await qr.release();
    }
  }
  // /**
  //  * 회원가입
  //  * @param createUserDto
  //  * @returns user
  //  */
  // async register(dto: CreateUserDto): Promise<User> {
  //   const user = User.signup(dto);
  //   return await this.userRepository.save(user);

  //   // user.password = hashedPassword(
  //   //   user.password,
  //   //   parseInt(this.confgiService.get<string>(ENV_CONFIG.AUTH.HASH_ROUNDS)),
  //   // );

  //   // user.phoneNumber = hashedPhone(
  //   //   user.phoneNumber,
  //   //   parseInt(this.confgiService.get<string>(ENV_CONFIG.AUTH.HASH_ROUNDS)),
  //   // );
  // }

  // /**
  //  * 중복 이메일 체크
  //  * @param email 이메일
  //  * @returns boolean
  //  */
  // async checkExistEmail(email: string): Promise<boolean> {
  //   const isExistEmail = await this.userRepository.existByEmail(email);

  //   if (isExistEmail) {
  //     throw new ConflictException(HttpErrorConstants.EXIST_EMAIL);
  //   }
  //   return isExistEmail;
  // }
}
