import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class BaseModel {
  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;

  @DeleteDateColumn({ default: null })
  @Exclude()
  deletedAt: Date | null;

  @VersionColumn()
  version: number;
}
