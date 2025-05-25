import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

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
    type: 'integer',
    nullable: true,
    comment: 'header front image id',
  })
  headerId: number | null;

  @Column({
    type: 'integer',
    nullable: true,
    comment: 'body front image id',
  })
  bodyId: number | null;

  @Column({
    type: 'varchar',
    length: 8,
    nullable: true,
    comment: 'avatar header color ( hex code )',
  })
  headerColor: string | null;

  @Column({
    type: 'varchar',
    length: 8,
    nullable: true,
    comment: 'avatar body color ( hex code )',
  })
  bodyColor: string | null;

  // 1-to-1 ------------------------------------------------------------------- //

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
