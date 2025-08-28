import { Prisma, User } from '@prisma/client';
import { IRepository } from 'src/infrastructure/database/prisma/repository.interface';
import { UserEntity } from 'src/user/domain/entities/user.entity';

export interface IUserRepository extends IRepository<User> {
  existByEmail(email: string): Promise<boolean>;
  existByEmailAndAuthType(email: string): Promise<boolean>;
  findOrCreateSocialUser(
    user: UserEntity,
    tx?: Prisma.TransactionClient,
  ): Promise<{ user: UserEntity; isNew: boolean }>;
  findOrCreateLocalUser(dto: UserEntity, tx?: Prisma.TransactionClient): Promise<{ user: UserEntity; isNew: boolean }>;
  findAllRefToken(userId: number): Promise<UserEntity | null>;
  softDeleteUserInTransaction(userId: number, tx: Prisma.TransactionClient): Promise<User>;
  findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<UserEntity | null>;
  findByUserId(id: number): Promise<UserEntity | null>;
  deleteByUser(id: number, tx?: Prisma.TransactionClient): Promise<number>;
}
