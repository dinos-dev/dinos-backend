import { BaseModel } from 'src/common/entities/base.entity';
import { User } from 'src/domain/user/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PlatFormEnumType } from '../constant/platform.const';

@Entity()
export class Token extends BaseModel {
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

  @Index()
  @Column({
    type: 'varchar',
  })
  refToken: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    type: 'enum',
    enum: Object.values(PlatFormEnumType),
  })
  platForm: PlatFormEnumType;

  // M-to-1------------------------------------------------------------------ //

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
