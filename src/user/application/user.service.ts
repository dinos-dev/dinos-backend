import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { CreateUserProfileDto } from '../presentation/dto/request/create-user-profile.dto';
import { HttpUserErrorConstants } from './helper/http-error-object';
import { UpdateUserProfileDto } from '../presentation/dto/request/update-user-profile.dto';
import { PROFILE_REPOSITORY, TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/common/config/common.const';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Profile } from '@prisma/client';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { ITokenRepository } from '../../auth/domain/repository/token.repository.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 유저 프로필 생성
   * @param userId
   * @param dto CreateUserProfileDto
   * @returns UserProfile
   */
  async createProfile(userId: number, dto: CreateUserProfileDto): Promise<Profile> {
    // 1) 유저 조회
    const user = await this.userRepository.findById(userId);

    if (!user) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_USER);

    // 2) 중첩 프로필 확인
    const existingProfile = await this.profileRepository.findByUserId(userId);

    if (existingProfile) throw new ConflictException(HttpUserErrorConstants.CONFLICT_USER_PROFILE);

    // 3) 프로필 생성
    return await this.profileRepository.createProfile(dto, userId);
  }

  /**
   * 유저 프로필 수정
   * @param id profileId
   * @param dto
   * @returns UserProfile
   */
  async updateProfile(id: number, dto: UpdateUserProfileDto): Promise<Profile> {
    // 1) 프로필 조회
    const profile = await this.profileRepository.findById(id);

    if (!profile) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE);

    // 2) 프로필 업데이트
    await this.profileRepository.update(id, dto);

    return await this.profileRepository.findById(id);
  }

  /**
   * 회원탈퇴 ( soft delete )
   * @param userId
   * @returns
   */
  async withdrawUser(userId: number): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.userRepository.softDeleteUserInTransaction(userId, tx);
        await this.tokenRepository.deleteManyByUserId(userId, tx);
        await this.profileRepository.deleteManyByUserId(userId, tx);
      });
    } catch (err) {
      console.error('Transaction error:', err);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 유저 프로필 조회
   * @param userId
   * @returns UserProfile
   */
  async findByProfile(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE);
    return profile;
  }
}
