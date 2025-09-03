import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaModule } from '../database/prisma/prisma.module';
import { PrismaService } from '../database/prisma/prisma.service';

/**
 * 트랜잭션 플러그인 설정을 담당하는 팩토리 함수
 * CLS 기반 트랜잭션 관리를 위한 Prisma 어댑터 설정
 */
export const createTransactionalPlugin = (): ClsPluginTransactional => {
  return new ClsPluginTransactional({
    imports: [PrismaModule], // PrismaService를 주입받기 위해 import
    adapter: new TransactionalAdapterPrisma({
      // PrismaService 토큰을 사용하여 Prisma Client 주입
      prismaInjectionToken: PrismaService,
    }),
  });
};

/**
 * 트랜잭션 관련 기본 옵션 설정
 */
export const TRANSACTIONAL_OPTIONS = {
  global: true, // 전역적으로 사용 가능하도록 설정
  middleware: {
    mount: true, // 모든 라우트에 ClsMiddleware 자동 마운트
  },
} as const;
