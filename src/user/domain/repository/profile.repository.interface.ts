import { ProfileEntity } from '../entities/user-profile.entity';

export interface IProfileRepository {
  findById(id: number): Promise<ProfileEntity | null>;
  createProfile(entity: ProfileEntity): Promise<ProfileEntity>;
  findByUserId(userId: number): Promise<ProfileEntity | null>;
  updateById(id: number, entity: ProfileEntity): Promise<ProfileEntity>;
  deleteManyByUserId(userId: number): Promise<number>;
}
