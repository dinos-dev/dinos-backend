import { Global, Module } from '@nestjs/common';
import { ClsModule as NestjsClsModule } from 'nestjs-cls';
import { createTransactionalPlugin, TRANSACTIONAL_OPTIONS } from './prisma.transaction.config';

/**
 * CLS (Continuation Local Storage) 및 트랜잭션 관리를 위한 모듈
 * AsyncLocalStorage 기반의 요청별 컨텍스트 관리와
 * 선언적 트랜잭션 처리(@Transactional 데코레이터)를 제공
 */
@Global()
@Module({
  imports: [
    NestjsClsModule.forRoot({
      global: TRANSACTIONAL_OPTIONS.global,
      middleware: TRANSACTIONAL_OPTIONS.middleware,
      plugins: [
        createTransactionalPlugin(), // Prisma 트랜잭션 플러그인 설정
      ],
    }),
  ],
  exports: [NestjsClsModule], // 다른 모듈에서 ClsService 사용 가능하도록 export
})
export class ClsModule {}
