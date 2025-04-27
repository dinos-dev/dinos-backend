import { Exclude } from 'class-transformer';
import { BaseModel } from 'src/common/entities/base.entity';
import { Token } from 'src/domain/auth/entities/token.entity';
import { Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { SocialAccount } from '../../auth/entities/social-account.entity';

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
    length: 30,
  })
  userName: string;

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

  @OneToMany(() => SocialAccount, (socialAccount) => socialAccount.user)
  socialAccounts: SocialAccount[];

  /** Sign Up Local */
  static signupLocal({ email, userName, password }: { email: string; userName: string; password: string }) {
    const user = new User();
    user.email = email;
    user.userName = userName;
    user.password = password;
    return user;
  }

  /** Sign Up Social */
  static signupSocial({ email, userName }: { email: string; userName: string }) {
    const user = new User();
    user.email = email;
    user.userName = userName;
    return user;
  }
}
