import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './core/swagger/swagger-config';
import { middleware } from './app.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { winstonLogger } from './core/utils/winston.logger';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: winstonLogger, // replacing logger
  });

  middleware(app);

  if (!isProduction) {
    initSwagger(app);
  }

  await app.listen(3000);
}
bootstrap();
