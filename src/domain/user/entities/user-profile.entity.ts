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
    type: 'integer',
    unsigned: true,
    comment: 'avatar header id',
  })
  avatarHeaderId: number;

  @Column({
    type: 'integer',
    unsigned: true,
    comment: 'avatar body id',
  })
  avatarBodyId: number;

  // ------------------------------------------------------------------------ //

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

  // 1-to-1 ------------------------------------------------------------------- //

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // M-to-M ------------------------------------------------------------------- //

  @ManyToOne(() => Avatar, { nullable: true })
  @JoinColumn({ name: 'avatar_header_id' })
  avatarHeader: Avatar;

  @ManyToOne(() => Avatar, { nullable: true })
  @JoinColumn({ name: 'avatar_body_id' })
  avatarBody: Avatar;
}
