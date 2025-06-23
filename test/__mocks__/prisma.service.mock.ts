import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

export type MockPrismaService = DeepMockProxy<PrismaClient>;

export const mockPrismaService = () => mockDeep<PrismaClient>();
