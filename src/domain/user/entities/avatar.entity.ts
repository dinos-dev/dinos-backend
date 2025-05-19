import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AvatarType } from '../constant/avatar.enum';
import { UserProfile } from './user-profile.entity';

@Entity()
export class Avatar {
  @PrimaryGeneratedColumn({
    comment: 'PK',
    type: 'integer',
    unsigned: true,
  })
  id: number;

  // ------------------------------------------------------------------------ //

  @Column({
    type: 'enum',
    enum: AvatarType,
  })
  type: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;

  // 1-to-M ------------------------------------------------------------------- //

  @OneToMany(() => UserProfile, (userProfile) => userProfile.avatarHeader)
  userProfileHeader: UserProfile[];

  @OneToMany(() => UserProfile, (userProfile) => userProfile.avatarBody)
  userProfileBody: UserProfile[];
}
