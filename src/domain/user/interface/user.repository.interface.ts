import { Prisma, User } from '@prisma/client';
import { SocialUserDto } from '../dto/request/social-user.dto';
import { CreateUserDto } from '../dto/request/create-user.dto';

export interface IUserRepository {
  existByEmail(email: string): Promise<boolean>;
  findOrCreateSocialUser(dto: SocialUserDto): Promise<User>;
  findAllRefToken(userId: number): Promise<Prisma.UserGetPayload<{ include: { tokens: true } }> | null>;
  findUserWithProfileById(userId: number): Promise<User>;
  findOrCreateLocalUser(dto: CreateUserDto): Promise<User>;
}
