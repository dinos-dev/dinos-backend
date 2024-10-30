import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { hashedPassword } from 'src/core/utils/password.utils';
import { ENV_CONFIG } from 'src/common/const/env-keys.const';
import { hashedPhone } from 'src/core/utils/phone-number.utils';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly confgiService: ConfigService,
  ) {}

  /**
   * 회원가입
   * @param createUserDto
   * @returns user
   */
  async register(dto: CreateUserDto): Promise<User> {
    await this.checkExistEmail(dto.email);

    const user = User.signup(dto);

    user.password = hashedPassword(
      user.password,
      parseInt(this.confgiService.get<string>(ENV_CONFIG.AUTH.HASH_ROUNDS)),
    );

    user.phoneNumber = hashedPhone(
      user.phoneNumber,
      parseInt(this.confgiService.get<string>(ENV_CONFIG.AUTH.HASH_ROUNDS)),
    );

    return await this.userRepository.save(user);
  }

  /**
   * 중복 이메일 체크
   * @param email 이메일
   * @returns boolean
   */
  async checkExistEmail(email: string): Promise<boolean> {
    const isExistEmail = await this.userRepository.existByEmail(email);

    if (isExistEmail) {
      throw new ConflictException(HttpErrorConstants.EXIST_EMAIL);
    }
    return isExistEmail;
  }
}
