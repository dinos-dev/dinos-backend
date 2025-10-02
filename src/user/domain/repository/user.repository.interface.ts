import { TokenEntity } from 'src/auth/domain/entities/token.entity';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { ProfileEntity } from '../entities/profile.entity';

export interface IUserRepository {
  existByEmail(email: string): Promise<boolean>;
  existByEmailAndAuthType(email: string): Promise<boolean>;
  findOrCreateSocialUser(user: UserEntity): Promise<{ user: UserEntity; isNew: boolean }>;
  findOrCreateLocalUser(dto: UserEntity): Promise<{ user: UserEntity; isNew: boolean }>;
  findAllRefToken(userId: number): Promise<{ user: UserEntity; tokens: TokenEntity[] }>;
  softDeleteUserInTransaction(userId: number): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUserId(id: number): Promise<UserEntity | null>;
  deleteByUser(id: number): Promise<number>;
  findByUserProfile(userId: number): Promise<{ user: UserEntity; profile: ProfileEntity }>;
}
