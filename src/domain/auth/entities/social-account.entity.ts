import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Provider } from '../helper/provider.enum';

@Entity()
@Index(['provider', 'providerId'])
export class SocialAccount extends BaseModel {
  @PrimaryGeneratedColumn({
    comment: 'PK',
    type: 'integer',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'enum',
    enum: Object.values(Provider),
    default: Provider.LOCAL,
  })
  provider: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  providerId: string;

  @ManyToOne(() => User, (user) => user.socialAccounts, { onDelete: 'CASCADE' })
  user: User;
}
