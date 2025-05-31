import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { UserRepository } from './repository/user.repository';
import { User } from './entities/user.entity';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { Token } from '../auth/entities/token.entity';
import { DataSource } from 'typeorm';
import { UserProfileRepository } from './repository/user-profile.repository';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/request/create-user-profile.dto';
import { HttpUserErrorConstants } from './helper/http-error-object';
import { UpdateUserProfileDto } from './dto/request/update-user-profile.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 유저 프로필 생성
   * @param userId
   * @param dto CreateUserProfileDto
   * @returns UserProfile
   */
  async createProfile(userId: number, dto: CreateUserProfileDto): Promise<UserProfile> {
    // 1) 유저 조회
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_USER);

    // 2) 중첩 프로필 확인
    const existingProfile = await this.userProfileRepository.findByUserId(userId);

    if (existingProfile) throw new ConflictException(HttpUserErrorConstants.CONFLICT_USER_PROFILE);

    // 3) 프로필 생성
    const newProfile = this.userProfileRepository.create({
      ...dto,
      userId,
    });

    return await this.userProfileRepository.save(newProfile);
  }

  /**
   * 유저 프로필 수정
   * @param id profileId
   * @param dto
   * @returns UserProfile
   */
  async updateProfile(id: number, dto: UpdateUserProfileDto): Promise<UserProfile> {
    // 1) 프로필 조회
    const profile = await this.userProfileRepository.findOne({
      where: {
        id,
      },
    });

    if (!profile) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE);

    // 2) 프로필 업데이트
    const updatedProfile = this.userProfileRepository.merge(profile, dto);

    return await this.userProfileRepository.save(updatedProfile);
  }

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
   * 유저 프로필 조회
   * @param userId
   * @returns UserProfile
   */
  async findByProfile(userId: number): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE);
    return profile;
  }
}
