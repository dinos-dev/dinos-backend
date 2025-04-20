import { BaseModel } from 'src/common/entities/base.entity';
import { User } from 'src/domain/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PlatFormEnumType } from '../helper/platform.const';

@Entity()
export class RefreshToken extends BaseModel {
  @PrimaryGeneratedColumn({
    comment: 'PK',
    type: 'integer',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'varchar',
  })
  refToken: string;

  @Column({
    type: 'enum',
    enum: Object.values(PlatFormEnumType),
  })
  platForm: PlatFormEnumType;

  @ManyToOne(() => User, (user) => user.refToken, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
