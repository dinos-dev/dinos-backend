import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Avatar } from './avatar.entity';

@Entity()
export class UserProfile extends BaseModel {
  @PrimaryGeneratedColumn({
    comment: 'PK',
    type: 'integer',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'integer',
    unsigned: true,
    comment: '유저 id',
  })
  userId: number;

  @Column({
    length: 20,
  })
  nickName: string;

  @Column({
    length: 50,
    nullable: true,
    comment: '프로필 소개 및 간단소개',
  })
  comment: string;

  @Column()
  profileName: string;

  @Column()
  profilePath: string;

  @OneToOne(() => User, (user) => user.id)
  user: User;

  @Column({
    type: 'varchar',
    length: 8,
    nullable: true,
    comment: 'avatar header color ( hex code )',
  })
  avatarHeaderColor: string | null;

  @Column({
    type: 'varchar',
    length: 8,
    nullable: true,
    comment: 'avatar body color ( hex code )',
  })
  avatarBodyColor: string | null;

  @ManyToOne(() => Avatar, { nullable: true })
  @JoinColumn({ name: 'avatar_header_id' })
  avatarHeader: Avatar;

  @ManyToOne(() => Avatar, { nullable: true })
  @JoinColumn({ name: 'avatar_body_id' })
  avatarBody: Avatar;
}
