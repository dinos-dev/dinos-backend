import { Prisma, User } from '@prisma/client';
import { SocialUserDto } from '../../presentation/dto/request/social-user.dto';
import { CreateUserDto } from '../../presentation/dto/request/create-user.dto';
import { IRepository } from 'src/infrastructure/database/prisma/repository.interface';

export interface IUserRepository extends IRepository<User> {
  existByEmail(email: string): Promise<boolean>;
  existByEmailAndAuthType(email: string): Promise<boolean>;
  findOrCreateSocialUser(dto: SocialUserDto, tx?: Prisma.TransactionClient): Promise<{ user: User; isNew: boolean }>;
  findAllRefToken(userId: number): Promise<Prisma.UserGetPayload<{ include: { tokens: true } }> | null>;
  findOrCreateLocalUser(dto: CreateUserDto, tx?: Prisma.TransactionClient): Promise<{ user: User; isNew: boolean }>;
  softDeleteUserInTransaction(userId: number, tx: Prisma.TransactionClient): Promise<User>;
  findByUnique<K extends keyof User>(key: K, value: User[K], tx?: Prisma.TransactionClient): Promise<User | null>;
  deleteById(id: number, tx?: Prisma.TransactionClient): Promise<User>;
}
