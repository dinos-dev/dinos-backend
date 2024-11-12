import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SocialAuthEnum } from 'src/domains/auth/consts/social-auth.enum';
import { SocialUserDto } from '../dto/social-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async existByEmail(email: string): Promise<boolean> {
    const existEmail = await this.exists({
      where: {
        email,
      },
    });

    return existEmail;
  }

  /**
   * 이메일 & 인증타입에 따른 가입여부 체크
   * @param email
   * @param authType
   * @returns boolean
   */
  async existByEmailAndAuthType(email: string, authType: SocialAuthEnum): Promise<boolean> {
    const isExistEmailAndAuthType = await this.exists({
      where: {
        email,
        authType,
      },
    });
    return isExistEmailAndAuthType;
  }

  /**
   * @param dto SocialUserDto
   */
  async findOrCreate(dto: SocialUserDto) {
    const user = await this.findOne({
      select: {
        id: true,
        email: true,
        authType: true,
      },
      where: {
        email: dto.email,
        authType: dto.authType,
      },
    });

    if (user) {
      return user;
    } else {
      const newUser = User.signup(dto);
      return await this.save(newUser);
    }
  }
}
