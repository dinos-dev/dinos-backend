import { Prisma, Profile } from '@prisma/client';
import { IRepository } from 'src/infrastructure/database/prisma/repository.interface';
import { ProfileEntity } from '../entities/user-profile.entity';

export interface IProfileRepository extends IRepository<Profile> {
  createProfile(entity: ProfileEntity, tx?: Prisma.TransactionClient): Promise<Profile>;
  findByUserId(userId: number): Promise<ProfileEntity | null>;
  updateById(id: number, entity: ProfileEntity): Promise<ProfileEntity>;
  deleteManyByUserId(userId: number, tx: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
