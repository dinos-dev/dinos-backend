import { Exclude } from 'class-transformer';
import { BaseModel } from 'src/common/entities/base.entity';
import { SocialAuthEnum } from 'src/domain/auth/helper/social-auth.enum';
import { RefreshToken } from 'src/domain/auth/entities/refresh-token.entity';
import { Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';

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
    // unique: true,
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
    type: 'enum',
    enum: Object.values(SocialAuthEnum),
    comment: '소셜 가입 방식 유형',
  })
  authType: string;

  @Exclude()
  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Exclude()
  @DeleteDateColumn({ default: null })
  deletedAt: Date | null;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.id, {
    cascade: true,
  })
  @JoinColumn()
  userProfile: UserProfile;

  @OneToMany(() => RefreshToken, (refToken) => refToken.user)
  refToken: RefreshToken[];

  static signup({ email, userName, authType }: { email: string; userName: string; authType: SocialAuthEnum }) {
    const user = new User();
    user.email = email;
    user.userName = userName;
    user.authType = authType;
    return user;
  }
}
