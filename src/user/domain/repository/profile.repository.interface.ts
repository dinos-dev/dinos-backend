import { Prisma, Profile } from '@prisma/client';
import { CreateUserProfileDto } from '../../presentation/dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from '../../presentation/dto/request/update-user-profile.dto';

export interface IProfileRepository {
  findById(id: number): Promise<Profile>;
  findByUserId(userId: number): Promise<Profile>;
  createProfile(dto: CreateUserProfileDto, userId: number): Promise<Profile>;
  update(id: number, dto: UpdateUserProfileDto): Promise<Profile>;
  deleteManyByUserId(userId: number, tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
