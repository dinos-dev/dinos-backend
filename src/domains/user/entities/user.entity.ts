import { Exclude } from 'class-transformer';
import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
    length: 255,
  })
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  phoneNumber: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  userName: string;

  static signup({
    email,
    password,
    phoneNumber,
    userName,
  }: {
    email: string;
    password: string;
    phoneNumber: string;
    userName: string;
  }) {
    const user = new User();
    user.email = email;
    user.password = password;
    user.phoneNumber = phoneNumber;
    user.userName = userName;
    return user;
  }
}
