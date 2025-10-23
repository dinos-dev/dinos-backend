import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { HttpUserErrorConstants } from './helper/http-error-object';

import {
  INVITE_CODE_REPOSITORY,
  PROFILE_REPOSITORY,
  TOKEN_REPOSITORY,
  USER_QUERY_REPOSITORY,
  USER_REPOSITORY,
} from 'src/common/config/common.const';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { ITokenRepository } from '../../auth/domain/repository/token.repository.interface';
import { UserProfileCommand } from './command/user-profile.command';
import { ProfileEntity } from '../domain/entities/profile.entity';
import { Transactional } from '@nestjs-cls/transactional';
import { IInviteCodeRepository } from '../domain/repository/invite-code.repository.interface';
import { UserEntity } from '../domain/entities/user.entity';
import { IUserQuery } from './interface/user-query.interface';
import { UserProfileWithInviteDto } from './dto/user-profile-with-invite.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    @Inject(INVITE_CODE_REPOSITORY)
    private readonly inviteCodeRepository: IInviteCodeRepository,
    @Inject(USER_QUERY_REPOSITORY)
    private readonly userQueryRepository: IUserQuery,
  ) {}

  /**
   * 유저 프로필 생성
   * @param command CreateUserProfileCommand
   * @returns UserProfile
   */
  async createProfile(command: UserProfileCommand): Promise<ProfileEntity> {
    // 1) 유저 조회
    const user = await this.userRepository.findByUserId(command.userId);

    if (!user) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_USER);

    // 2) 중첩 프로필 확인
    const existingProfile = await this.profileRepository.findByUserId(command.userId);

    if (existingProfile) throw new ConflictException(HttpUserErrorConstants.CONFLICT_USER_PROFILE);

    // 3) profile instance 생성
    const profileEntity = ProfileEntity.create(command);

    // 4) 프로필 생성
    return await this.profileRepository.createProfile(profileEntity);
  }

  /**
   * 유저 프로필 수정
   * @param id - profileId
   * @param command
   * @returns UserProfile
   */
  async updateProfile(id: number, command: UserProfileCommand): Promise<ProfileEntity> {
    // 1) 프로필 조회
    const profile = await this.profileRepository.findById(id);

    // 2) 프로필 존재 여부 및 본인의 프로필 일치여부 핸들링

    if (!profile) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE);

    if (profile.userId !== command.userId) throw new ForbiddenException(HttpUserErrorConstants.FORBIDDEN_USER_PROFILE);

    // 3) 유저 프로필 instance 생성
    const profileEntity = ProfileEntity.create(command);

    // 4) 프로필 업데이트 및 반환
    return await this.profileRepository.updateById(id, profileEntity);
  }

  /**
   * 회원탈퇴 - 현 정책상 softDelete 하지 않고 Delete 처리
   * @param userId
   * @returns
   */
  @Transactional()
  async withdrawUser(userId: number): Promise<void> {
    try {
      await this.userRepository.deleteByUser(userId);
      await this.tokenRepository.deleteManyByUserId(userId);
      await this.profileRepository.deleteManyByUserId(userId);
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
  async findByProfileWithInviteInfo(userId: number): Promise<UserProfileWithInviteDto> {
    const profile = await this.userQueryRepository.findProfileByUserId(userId);
    if (!profile) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE);
    return profile;
  }

  /**
   * 초대코드 기반 유저 조회
   * @param code
   * @returns User
   */
  async findByInviteCode(inviteCode: string): Promise<{ user: UserEntity; profile: ProfileEntity }> {
    const inviteCodeByUser = await this.inviteCodeRepository.findByUnique('code', inviteCode);
    if (!inviteCodeByUser) throw new NotFoundException(HttpUserErrorConstants.NOT_FOUND_USER);

    const { user, profile } = await this.userRepository.findByUserProfile(inviteCodeByUser.userId);

    return { user, profile };
  }
}
