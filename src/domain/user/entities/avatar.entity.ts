import { BaseModel } from 'src/common/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Avatar extends BaseModel {
  @PrimaryGeneratedColumn({
    comment: 'PK',
    type: 'integer',
    unsigned: true,
  })
  id: number;

  @Column({
    type: 'smallint',
    comment: '아바타의 헤더 이미지 경로값',
  })
  header: number;

  @Column({
    type: 'smallint',
    comment: '아바타의 바디 이미지 경로값',
  })
  body: number;

  @Column({
    type: 'varchar',
    comment: '아바타의 헤더 칼라 헥사 코드',
  })
  headerColor: string;

  @Column({
    type: 'varchar',
    comment: '아바타의 바디 칼라 헥사 코드',
  })
  bodyColor: string;
}
