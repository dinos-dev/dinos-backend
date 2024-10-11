import {
  Global,
  Module,
  NestModule,
  MiddlewareConsumer,
  Logger,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { LoggerContextMiddleware } from './middleware/logger-context.middleware';

@Global()
@Module({
  providers: [CommonService, Logger],
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerContextMiddleware).forRoutes('*');
  }
}
