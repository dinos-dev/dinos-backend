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
    length: 45,
  })
  nickName: string;

  @Column()
  profileName: string;

  @Column()
  profilePath: string;

  @OneToOne(() => User, (user) => user.id)
  user: User;
}
