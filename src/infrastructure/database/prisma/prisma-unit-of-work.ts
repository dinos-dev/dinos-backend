import { Injectable } from '@nestjs/common';
import { IUnitOfWork } from 'src/common/domain/unit-of-work.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async () => {
      return await work();
    });
  }
}
