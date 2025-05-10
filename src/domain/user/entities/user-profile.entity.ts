import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
}
