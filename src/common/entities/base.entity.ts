import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export abstract class BaseModel {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
