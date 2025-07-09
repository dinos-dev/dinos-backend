import { Prisma, Profile } from '@prisma/client';
import { CreateUserProfileDto } from '../../presentation/dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from '../../presentation/dto/request/update-user-profile.dto';
import { IRepository } from 'src/infrastructure/database/prisma/repository.interface';

export interface IProfileRepository extends IRepository<Profile> {
  createProfile(dto: CreateUserProfileDto, userId: number): Promise<Profile>;
  updateById(id: number, dto: UpdateUserProfileDto): Promise<Profile>;
  deleteManyByUserId(userId: number, tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
