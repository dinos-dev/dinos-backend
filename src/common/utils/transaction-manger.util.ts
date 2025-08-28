import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
// import { TRANSACTIONAL_KEY } from '../decorator/transaction.decorator';

export type TransactionStore = {
  txClient?: Prisma.TransactionClient;
};

@Injectable()
export class TransactionManager implements OnModuleInit {
  private readonly asyncLocalStorage = new AsyncLocalStorage<TransactionStore>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // this.wrapTransactionalMethods();
  }

  // private wrapTransactionalMethods() {
  //   const providers = this.discoveryService
  //     .getProviders()
  //     .filter((w) => w.isDependencyTreeStatic())
  //     .filter((w) => w.instance && Object.getPrototypeOf(w.instance))
  //     .map((w) => w.instance);

  //   providers.forEach((instance) => {
  //     const prototype = Object.getPrototypeOf(instance);
  //     const methodNames = this.metadataScanner.getAllMethodNames(prototype);
  //     methodNames.forEach((name) => {
  //       const method = instance[name];
  //       if (this.reflector.get<boolean>(TRANSACTIONAL_KEY, method)) {
  //         instance[name] = this.wrapWithTransaction(method, instance);
  //       }
  //     });
  //   });
  // }

  // private wrapWithTransaction(original: any, instance: any) {
  //   return async (...args: any[]) => {
  //     const current = this.prisma.getCurrentClient();
  //     // 이미 트랜잭션 중이면 원본 실행
  //     if (current !== this.prisma) {
  //       return original.apply(instance, args);
  //     }
  //     // 새 트랜잭션 시작
  //     return this.prisma.executeInTransaction(() => original.apply(instance, args));
  //   };
  // }
}
