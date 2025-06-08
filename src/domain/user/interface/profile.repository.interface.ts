import { Profile } from '@prisma/client';
import { CreateUserProfileDto } from '../dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from '../dto/request/update-user-profile.dto';

export interface IProfileRepository {
  findByUserId(userId: number): Promise<Profile>;
  create(dto: CreateUserProfileDto, userId: number): Promise<Profile>;
  update(id: number, dto: UpdateUserProfileDto): Promise<Profile>;
}
