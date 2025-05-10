import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { Token } from '../auth/entities/token.entity';
import { DataSource } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 회원탈퇴
   * @param userId
   * @returns
   */
  async withdrawUser(userId: number): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      await qr.manager.delete(User, {
        id: userId,
      });
      await qr.manager.delete(Token, {
        user: { id: userId },
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

  /**
   * 유저 단일 조회
   * @param userId
   * @returns
   */
  async findById(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_USER);
    }
    return user;
  }
}
