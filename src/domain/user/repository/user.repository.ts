import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SocialUserDto } from '../dto/social-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { hashPassword } from 'src/core/helper/password.util';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(User, userRepository.manager, userRepository.queryRunner);
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
   * @returns boolean
   */
  async existByEmailAndAuthType(email: string): Promise<boolean> {
    const isExistEmailAndAuthType = await this.exists({
      where: {
        email,
      },
    });
    return isExistEmailAndAuthType;
  }

  /**
   * FindOne OR Create Social User
   * @param dto SocialUserDto
   * @returns user
   */
  async findOrCreateSocialUser(dto: SocialUserDto): Promise<User> {
    const user = await this.findOne({
      select: {
        id: true,
        email: true,
        name: true,
      },
      where: {
        email: dto.email,
      },
    });

    if (user) {
      return user;
    } else {
      const newUser = User.signupSocial(dto);
      await this.save(newUser);
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

  /**
   * FindOne OR Create Local User
   * @param dto CreateUserDto
   * @returns
   */
  async findOrCreateLocalUser(dto: CreateUserDto) {
    const user = await this.findOne({
      select: {
        id: true,
        email: true,
        name: true,
      },
      where: {
        email: dto.email,
      },
    });
    if (user) {
      return user;
    } else {
      const hashedPassword = hashPassword(dto.password);
      const newUser = User.signupLocal({ ...dto, password: hashedPassword });
      await this.save(newUser);
      return newUser;
    }
  }
}
