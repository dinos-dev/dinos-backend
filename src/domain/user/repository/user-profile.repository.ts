import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserProfileRepository extends Repository<UserProfile> {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {
    super(UserProfile, userProfileRepository.manager, userProfileRepository.queryRunner);
  }

  /**
   * userId 기반 프로필 조회
   * @param userId
   * @returns UserProfile
   */
  async findByUserId(userId: number): Promise<UserProfile> {
    return this.findOne({
      where: {
        userId,
      },
    });
  }
}
