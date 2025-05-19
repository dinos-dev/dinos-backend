import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Avatar } from '../entities/avatar.entity';

@Injectable()
export class AvatarRepository extends Repository<Avatar> {
  constructor(private dataSource: DataSource) {
    super(Avatar, dataSource.createEntityManager());
  }
}
