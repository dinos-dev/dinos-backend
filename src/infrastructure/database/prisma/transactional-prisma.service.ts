import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from './prisma.service';

@Injectable()
export class TransactionalPrismaService {
  private readonly als = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return this.als.run(tx, () => fn());
    });
  }

  getClient(): Prisma.TransactionClient {
    const store = this.als.getStore();
    return store ?? this.prisma;
  }
}
