import { Exclude } from 'class-transformer';
import { BaseModel } from 'src/common/entities/base.entity';
import { SocialAuthEnum } from 'src/domains/auth/consts/social-auth.enum';
import { RefreshToken } from 'src/domains/auth/entities/refresh-token.entity';
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({
    type: 'enum',
    enum: Object.values(SocialAuthEnum),
    comment: '소셜 가입 방식 유형',
  })
  authType: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @DeleteDateColumn({ default: null })
  @Exclude()
  deletedAt: Date | null;

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
