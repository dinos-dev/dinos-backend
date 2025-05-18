import { Exclude } from 'class-transformer';
import { BaseModel } from 'src/common/entities/base.entity';
import { Token } from 'src/domain/auth/entities/token.entity';
import { Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Provider } from 'src/domain/auth/constant/provider.enum';

@Entity()
export class User extends BaseModel {
  @PrimaryGeneratedColumn({
    comment: 'PK',
    type: 'integer',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'varchar',
    unique: true,
    length: 255,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  name: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  password: string;

  @Exclude()
  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: Object.values(Provider),
    default: Provider.LOCAL,
  })
  provider: Provider;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  providerId: string;

  @Exclude()
  @DeleteDateColumn({ default: null })
  deletedAt: Date | null;

  /** 1 to 1 */
  @OneToOne(() => UserProfile, (userProfile) => userProfile.id, {
    cascade: true,
  })
  @JoinColumn()
  userProfile: UserProfile;

  /** 1 to M */
  @Exclude()
  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  /** Sign Up Local */
  static signupLocal({ email, name, password }: { email: string; name: string; password: string }) {
    const user = new User();
    user.email = email;
    user.name = name;
    user.password = password;
    return user;
  }

  /** Sign Up Social */
  static signupSocial({
    email,
    name,
    provider,
    providerId,
  }: {
    email: string;
    name: string;
    provider: Provider;
    providerId: string;
  }) {
    const user = new User();
    user.email = email;
    user.name = name;
    user.provider = provider;
    user.providerId = providerId;
    return user;
  }
}
