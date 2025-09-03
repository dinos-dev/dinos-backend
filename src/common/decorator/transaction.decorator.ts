// import { SetMetadata } from '@nestjs/common';
import { TransactionalPrismaService } from 'src/infrastructure/database/prisma/transactional-prisma.service';

export const TRANSACTIONAL_KEY = Symbol('TRANSACTIONAL');

/**
 * 메서드를 트랜잭션으로 래핑하는 데코레이터
 * 기존 tx 파라미터 방식을 완전히 대체
 */
export const Transactional = (): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const txService: TransactionalPrismaService = this['transactionalPrismaService'];
      return txService.runInTransaction(() => original.apply(this, args));
    };
  };
  // return SetMetadata(TRANSACTIONAL_KEY, true);
};
