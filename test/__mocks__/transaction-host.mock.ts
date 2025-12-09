import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';

export type MockTransactionHost = TransactionHost<TransactionalAdapterPrisma> & {
  tx: DeepMockProxy<PrismaClient>;
};

export const mockTransactionHost = (mockPrisma: DeepMockProxy<PrismaClient>): MockTransactionHost => {
  return {
    tx: mockPrisma,
  } as MockTransactionHost;
};
