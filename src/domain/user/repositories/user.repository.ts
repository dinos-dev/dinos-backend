import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Provider } from 'src/domain/auth/helper/provider.enum';
import { SocialUserDto } from '../dto/social-user.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * 로컬 가입시 이메일 검증
   * @param email
   * @returns boolean
   */
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
  async existByEmailAndAuthType(email: string, authType: Provider): Promise<boolean> {
    const isExistEmailAndAuthType = await this.exists({
      where: {
        email,
      },
    });
    return isExistEmailAndAuthType;
  }

  /**
   * FindOne User OR Create
   * @param dto SocialUserDto
   * @returns user
   */
  async findOrCreate(dto: SocialUserDto, qr: QueryRunner): Promise<User> {
    const user = await qr.manager.findOne(User, {
      select: {
        id: true,
        email: true,
        userName: true,
      },
      where: {
        email: dto.email,
      },
    });

    if (user) {
      return user;
    } else {
      const newUser = User.signupSocial(dto);
      await qr.manager.save(User, newUser);
      return newUser;
    }
  }

  /**
   * get ref-token by user
   * @param userId
   * @returns Auth
   */
  async findAllRefToken(userId: number): Promise<User> {
    return await this.findOne({
      where: {
        id: userId,
      },
      relations: ['refToken'],
    });
  }

  /**
   * payLoad sub based user find
   * @param userId
   * @returns User
   */
  async findById(userId: number): Promise<User> {
    return await this.findOne({
      where: {
        id: userId,
      },
    });
  }
}
