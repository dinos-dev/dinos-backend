import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const enableDebug = process.env.NODE_ENV === 'development';
    super({
      log: enableDebug ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
