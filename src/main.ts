import './instrument';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './common/swagger/swagger-config';
import { middleware } from './app.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { WinstonLoggerService } from './infrastructure/logger/winston-logger.service';
import { HttpResponseInterceptor } from './common/interceptor/http-response.interceptor';
import { createGlobalValidationPipe } from './common/pipe/validation-pipe.config';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // WinstonLoggerService를 전역 로거로 설정
  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {}));

  app.useGlobalInterceptors(new HttpResponseInterceptor());

  app.useGlobalPipes(createGlobalValidationPipe());

  middleware(app);

  if (!isProduction) {
    initSwagger(app);
  }

  await app.listen(80);
}
bootstrap();
