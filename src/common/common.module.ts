import { Global, Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { LoggerContextMiddleware } from './middleware/logger-context.middleware';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    PrismaModule,
  ],
  providers: [
    Logger,
    // {
    //   provide: 'TransactionalAdapter',
    //   useClass: TransactionalAdapterPrisma,
    // },
  ],
  exports: [ClsModule],
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerContextMiddleware).forRoutes('*');
  }
}
