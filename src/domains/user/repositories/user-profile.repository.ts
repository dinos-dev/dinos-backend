import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';

@Injectable()
export class UserProfileRepository extends Repository<UserProfile> {
  constructor(private dataSource: DataSource) {
    super(UserProfile, dataSource.createEntityManager());
  }
}
