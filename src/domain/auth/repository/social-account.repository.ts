import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SocialAccount } from '../entities/social-account.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SocialAccountRepository extends Repository<SocialAccount> {
  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountRepository: Repository<SocialAccount>,
  ) {
    super(SocialAccount, socialAccountRepository.manager, socialAccountRepository.queryRunner);
  }
}
