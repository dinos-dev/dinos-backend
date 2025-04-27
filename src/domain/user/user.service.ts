import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { Token } from '../auth/entities/token.entity';
import { DataSource } from 'typeorm';
// import { Transactional } from 'src/core/decorators/transaction.decorator';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
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
      await qr.manager.softDelete(User, {
        id: userId,
      });
      await qr.manager.update(
        User,
        {
          id: userId,
        },
        {
          isActive: false,
        },
      );
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
  async findById(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_USER);
    }
    return user;
  }
}
